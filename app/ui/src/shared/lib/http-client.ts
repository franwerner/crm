import type { RequestConfig, ResponseConfig } from '@kubb/plugin-client/clients/fetch'
import { config } from './config'

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig } from '@kubb/plugin-client/clients/fetch'

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, statusText: string, body: unknown) {
    super(`API ${status} ${statusText}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function client<TResponseData, _TError = unknown, TRequestData = unknown>(
  requestConfig: RequestConfig<TRequestData>,
): Promise<ResponseConfig<TResponseData>> {
  const { baseURL = config.apiBasePath, url = '', method = 'GET', params, data, signal, headers } = requestConfig

  const query = new URLSearchParams()
  if (params && typeof params === 'object') {
    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
      if (value !== undefined && value !== null) query.append(key, String(value))
    }
  }
  const queryString = query.toString()
  const target = `${baseURL}${url}${queryString ? `?${queryString}` : ''}`

  const isFormData = data instanceof FormData
  const extraHeaders = Array.isArray(headers) ? Object.fromEntries(headers) : headers

  const response = await fetch(target, {
    method: method.toUpperCase(),
    credentials: 'include',
    signal,
    headers: {
      ...(isFormData || data === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...extraHeaders,
    },
    body: isFormData ? (data as FormData) : data !== undefined ? JSON.stringify(data) : undefined,
  })

  const hasNoBody = [204, 205, 304].includes(response.status) || !response.body
  const payload = hasNoBody ? undefined : await response.json().catch(() => undefined)

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, payload)
  }

  return {
    data: payload as TResponseData,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  }
}

export default client
