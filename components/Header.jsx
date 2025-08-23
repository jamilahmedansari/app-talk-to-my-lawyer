"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  User, 
  LogOut, 
  Building2, 
  Phone, 
  MapPin 
} from "lucide-react"

export default function Header({ 
  user, 
  onLogout, 
  onScrollToAuth, 
  onScrollToLetterTypes, 
  onScrollToHowItWorks, 
  onScrollToWhyChooseUs, 
  onScrollToContact 
}) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">talk-to-my-lawyer</h1>
              <p className="text-xs text-gray-600">Professional Legal Letters</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={onScrollToLetterTypes}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Letter Types
            </button>
            <button
              onClick={onScrollToHowItWorks}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              How It Works
            </button>
            <button
              onClick={onScrollToWhyChooseUs}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Why Choose Us
            </button>
            <button
              onClick={onScrollToContact}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Contact
            </button>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || user.email}
                  </span>
                </div>
                <Button
                  onClick={onLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onScrollToAuth}
                className="btn-professional"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}