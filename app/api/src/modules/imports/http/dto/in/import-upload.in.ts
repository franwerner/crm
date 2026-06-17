// No zod schema here — multipart is parsed manually in the controller (same pattern as
// project-document.controller.ts). MIME and size validation lives in the use-case (R1.1, R1.2).
// The HTTP layer extracts the raw File from parseBody and forwards it.

export interface UploadImportRequest {
  file: File
}
