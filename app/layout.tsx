import './globals.css'

export const metadata = {
  title: 'Fanfie',
  description: 'Take and upload photos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
