import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'talk-to-my-lawyer - Professional Legal Letters | Local Lawyer Drafter Letter for Conflict Resolution',
  description: 'Get Local Lawyer Drafter Letters for conflict resolution. Professional legal communication without expensive lawyer consultations. Effective, professionally crafted letters that get results.',
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" theme="light" />
        </AuthProvider>
      </body>
    </html>
  )
}
