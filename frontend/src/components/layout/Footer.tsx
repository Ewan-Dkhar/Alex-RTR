import { Link } from "react-router-dom"
import { Rocket, Mail, Globe } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Rocket size={18} />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Alex-RTR</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link to="/" className="text-gray-500 hover:text-blue-600 font-medium text-sm">Home</Link>
            <Link to="/chat" className="text-gray-500 hover:text-blue-600 font-medium text-sm">Chat</Link>
            <Link to="/how-it-works" className="text-gray-500 hover:text-blue-600 font-medium text-sm">How It Works</Link>
            <Link to="/about" className="text-gray-500 hover:text-blue-600 font-medium text-sm">About</Link>
            <a href="#" className="text-gray-500 hover:text-blue-600 font-medium text-sm">Contact</a>
          </nav>
          
          <div className="flex gap-4 text-gray-400">
            <a href="#" className="hover:text-gray-600"><Mail size={20} /></a>
            <a href="#" className="hover:text-gray-600"><Globe size={20} /></a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Alex-RTR. Built for Hackathon 2026.</p>
          <p>Designed with premium skeuomorphism in mind.</p>
        </div>
      </div>
    </footer>
  )
}
