import "./globals.css"

export const metadata = {
  title: "UXAuditPro",
  description: "AI UX Audit SaaS Platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {/* Global Page Wrapper */}
        <div className="fade-page bg-glow">
          {children}
        </div>
      </body>
    </html>
  )
}
