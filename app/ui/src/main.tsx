import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import '@app/globals.css'
import '@shared/lib/config/env'
import { Providers } from '@app/providers'
import { ErrorBoundary } from '@app/error-boundary'
import { router } from '@app/router'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('No se encontró el elemento #root')

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  </StrictMode>,
)
