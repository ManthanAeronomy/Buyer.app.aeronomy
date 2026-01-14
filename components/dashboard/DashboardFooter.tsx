// Simple footer component for dashboard
'use client'

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500">
          © {currentYear} Aeronomy. All rights reserved.
        </div>
        
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
        </div>
      </div>
    </footer>
  )
}




