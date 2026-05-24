import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error de render no capturado:', error, info)
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <h1>Algo salió mal</h1>
          <p>Recargá la página. Si el problema persiste, contactá al equipo.</p>
        </div>
      )
    }
    return this.props.children
  }
}
