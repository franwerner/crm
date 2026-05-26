import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Breadcrumbs } from './breadcrumbs'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-10">
          <div className="flex flex-col gap-8">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
