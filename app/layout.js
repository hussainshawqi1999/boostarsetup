export const metadata = {
  title: 'Stremio Manager',
  description: 'Manage your stremio addons easily',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  )
}
