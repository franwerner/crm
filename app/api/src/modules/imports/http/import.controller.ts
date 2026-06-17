import type { Context } from 'hono'
import { ValidationError } from '@shared/errors'
import { config } from '@shared/config'
import type { ImportUploadUseCase } from '@modules/imports/application/use-cases/import-upload.use-case'
import type { ImportSetMappingUseCase } from '@modules/imports/application/use-cases/import-set-mapping.use-case'
import type { ImportGetUseCase } from '@modules/imports/application/use-cases/import-get.use-case'
import type { SetMappingRequest } from '@modules/imports/http/dto/in/import-set-mapping.in'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export interface ImportsUseCases {
  upload: ImportUploadUseCase
  setMapping: ImportSetMappingUseCase
  get: ImportGetUseCase
}

export class ImportsController {
  constructor(private readonly ucs: ImportsUseCases) {}

  async uploadImport(c: Context): Promise<Response> {
    const userId = c.get('userId') as string

    const body = await c.req.parseBody()
    const file = body['file']

    if (!(file instanceof File)) {
      throw new ValidationError('Missing or invalid file field', [
        { field: 'file', message: 'expected an xlsx file upload in the "file" field' },
      ])
    }

    // MIME and size validation also runs in the use-case (R1.1, R1.2), but we guard
    // here too to surface a clear HTTP 400 before the use-case layer is invoked.
    if (!file.type || file.type !== XLSX_MIME) {
      throw new ValidationError('Invalid file type — only .xlsx files are accepted', [
        { field: 'file', message: `Expected ${XLSX_MIME}, got ${file.type || '(none)'}` },
      ])
    }

    if (file.size <= 0 || file.size > config.importMaxFileSizeBytes) {
      throw new ValidationError('File size is invalid', [
        { field: 'file', message: `size must be between 1 and ${config.importMaxFileSizeBytes} bytes` },
      ])
    }

    const result = await this.ucs.upload.execute({
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      body: file,
      createdBy: userId,
      maxFileSizeBytes: config.importMaxFileSizeBytes,
    })

    return c.json(
      {
        importId: result.importId,
        status: result.status,
        columnHeaders: result.columnHeaders,
      },
      201,
    )
  }

  async setMapping(c: Context): Promise<Response> {
    const importId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as SetMappingRequest

    const result = await this.ucs.setMapping.execute({
      importId,
      mapping: body.mapping,
      templateId: body.templateId ?? null,
    })

    return c.json(
      {
        importId: result.importId,
        status: result.status,
      },
      200,
    )
  }

  async getImportStatus(c: Context): Promise<Response> {
    const importId = c.req.param('id') as string

    const dto = await this.ucs.get.execute(importId)

    return c.json(
      {
        importId: dto.importId,
        status: dto.status,
        stage: dto.stage,
        totalRows: dto.totalRows,
        processedRows: dto.processedRows,
        okCount: dto.okCount,
        failedCount: dto.failedCount,
        duplicatedCount: dto.duplicatedCount,
        rejectedCsvUrl: dto.rejectedCsvUrl,
        columnHeaders: Array.from(dto.columnHeaders),
        createdAt: dto.createdAt.toISOString(),
        updatedAt: dto.updatedAt.toISOString(),
      },
      200,
    )
  }
}
