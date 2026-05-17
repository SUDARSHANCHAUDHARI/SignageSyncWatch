import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SyncWatch',
  description: 'Digital signage synchronization monitoring — detect screen drift, playlist mismatch, and visual desync',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <nav className="border-b border-gray-800 px-6 py-3 flex items-center gap-6 text-sm">
          <a href="/" className="font-bold text-white tracking-tight">SyncWatch</a>
          <a href="/groups" className="text-gray-400 hover:text-gray-200 transition">Groups</a>
          <a href="/reports" className="text-gray-400 hover:text-gray-200 transition">Reports</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
