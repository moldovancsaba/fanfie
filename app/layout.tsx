import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    &lt;html lang="en"&gt;
      &lt;body className="min-h-screen bg-background"&gt;{children}&lt;/body&gt;
    &lt;/html&gt;
  )
}
