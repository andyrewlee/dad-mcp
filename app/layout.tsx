export const metadata = {
  title: 'DadMCP',
  description: 'Provide better education at home with AI',
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
