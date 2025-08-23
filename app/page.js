"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  CheckCircle,
  Download,
  Send,
  Clock,
  Copy,
  Scale,
  Award,
  Heart,
  ArrowRight,
  CheckCheck,
  Upload,
  ChevronLeft,
} from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import jsPDF from "jspdf"
import { v4 as uuidv4 } from "uuid"

// Import our new components
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import AuthModal from "@/components/AuthModal"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [letters, setLetters] = useState([])
  const [refreshLetters, setRefreshLetters] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [popupShown, setPopupShown] = useState(false)

  // Auto-show popup after 3 seconds
  useEffect(() => {
    if (!popupShown && !user) {
      const timer = setTimeout(() => {
        setShowPopup(true)
        setPopupShown(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [popupShown, user])

  // Scroll functions
  const scrollToAuth = () => {
    const element = document.getElementById("get-started")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToLetterTypes = () => {
    const element = document.getElementById("letters")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToWhyChooseUs = () => {
    const element = document.getElementById("why-choose-us")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToContact = () => {
    const element = document.getElementById("contact-us")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Authentication functions
  const handleAuthSuccess = async (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    setShowAuthModal(false)

    try {
      const response = await fetch("/api/letters", {
        headers: { Authorization: `Bearer ${userToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setLetters(data.letters)
      }
    } catch (error) {
      console.error("Error fetching letters:", error)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    setLetters([])
    localStorage.removeItem("token")
    window.location.reload()
  }

  const createSubscriptionCheckout = async (packageType) => {
    setLoading(true)
    try {
      const response = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageType }),
      })

      const data = await response.json()

      if (response.ok) {
        const stripe = await stripePromise
        const result = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        })

        if (result.error) {
          toast.error(result.error.message)
        }
      } else {
        toast.error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  // Auto-login on page load
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user)
            setToken(savedToken)
          }
        })
        .catch((error) => {
          console.error("Auto-login error:", error)
          localStorage.removeItem("token")
        })
    }
  }, [])

  // Letter management functions
  const generateLetter = async (letterType, formData) => {
    if (!user) {
      toast.error("Please sign in to generate letters")
      return
    }

    try {
      const response = await fetch("/api/letters/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          letterType,
          formData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Letter generated successfully!")
        setRefreshLetters(prev => prev + 1)
      } else {
        toast.error(data.error || "Failed to generate letter")
      }
    } catch (error) {
      toast.error("Network error")
    }
  }

  const downloadLetter = (letter) => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text(letter.title, 20, 30)
    doc.setFontSize(12)
    doc.text(letter.content, 20, 50)
    doc.save(`${letter.title}.pdf`)
  }

  const copyLetterContent = (content) => {
    navigator.clipboard.writeText(content)
    toast.success("Letter content copied to clipboard!")
  }

  // Subscription plans data
  const subscriptionPlans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: 49,
      letters: 3,
      description: "Perfect for occasional legal needs",
      features: ["3 professional letters", "Attorney review", "48-hour delivery", "Email support"],
      popular: false,
    },
    {
      id: "professional",
      name: "Professional Plan",
      price: 99,
      letters: 8,
      description: "Great for regular legal communication",
      features: ["8 professional letters", "Priority attorney review", "24-hour delivery", "Phone support", "Letter templates"],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: 199,
      letters: 20,
      description: "For businesses with frequent legal needs",
      features: ["20 professional letters", "VIP attorney review", "Same-day delivery", "Dedicated support", "Custom templates", "Bulk discounts"],
      popular: false,
    },
  ]

  const currentPlan = user?.subscription_plan || "free"

  const formatPrice = (price) => `$${price}`

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onScrollToAuth={scrollToAuth}
        onScrollToLetterTypes={scrollToLetterTypes}
        onScrollToHowItWorks={scrollToHowItWorks}
        onScrollToWhyChooseUs={scrollToWhyChooseUs}
        onScrollToContact={scrollToContact}
      />

      {/* Hero Section */}
      <Hero
        onScrollToAuth={scrollToAuth}
        onScrollToLetterTypes={scrollToLetterTypes}
      />

      {/* Letter Types Section */}
      <section id="letters" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Letter Types
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We specialize in crafting effective legal letters for various situations. 
              Each letter is professionally written and attorney-reviewed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Demand Letters",
                description: "Professional demands for payment, action, or compliance",
                icon: "📋",
                features: ["Clear payment terms", "Legal consequences", "Professional tone"]
              },
              {
                title: "Cease & Desist",
                description: "Stop harassment, copyright infringement, or other violations",
                icon: "🛑",
                features: ["Clear violation details", "Immediate action required", "Legal basis"]
              },
              {
                title: "Contract Disputes",
                description: "Resolve contract disagreements professionally",
                icon: "📄",
                features: ["Contract analysis", "Breach identification", "Resolution terms"]
              },
              {
                title: "Employment Issues",
                description: "Address workplace problems and discrimination",
                icon: "💼",
                features: ["Issue documentation", "Legal rights", "Resolution steps"]
              },
              {
                title: "Property Disputes",
                description: "Resolve real estate and property conflicts",
                icon: "🏠",
                features: ["Property rights", "Dispute details", "Legal remedies"]
              },
              {
                title: "Consumer Complaints",
                description: "Professional complaints to businesses and agencies",
                icon: "📝",
                features: ["Issue documentation", "Desired outcome", "Legal basis"]
              }
            ].map((type, index) => (
              <Card key={index} className="card-modern hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">{type.icon}</div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {user && (
                    <Button
                      onClick={() => generateLetter(type.title.toLowerCase().replace(/\s+/g, '_'), {})}
                      className="w-full mt-4 btn-professional"
                    >
                      Generate {type.title}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting your professional legal letter is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Choose Your Letter",
                description: "Select from our professional letter types or describe your specific need",
                icon: "📝"
              },
              {
                step: "2",
                title: "Provide Details",
                description: "Fill out our simple form with the relevant information and context",
                icon: "📋"
              },
              {
                step: "3",
                title: "Attorney Review",
                description: "Our experienced attorneys review and craft your letter professionally",
                icon: "👨‍💼"
              },
              {
                step: "4",
                title: "Get Your Letter",
                description: "Receive your professional letter ready for use within 24-48 hours",
                icon: "✅"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Professional Letters?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine legal expertise with professional writing to deliver results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Scale,
                title: "Attorney Reviewed",
                description: "Every letter reviewed by licensed attorneys"
              },
              {
                icon: Clock,
                title: "Fast Delivery",
                description: "Professional letters delivered within 48 hours"
              },
              {
                icon: Award,
                title: "High Success Rate",
                description: "95% of our letters achieve desired outcomes"
              },
              {
                icon: Heart,
                title: "Satisfaction Guaranteed",
                description: "100% satisfaction or money back guarantee"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who have resolved their legal issues 
            with our professional letter service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowAuthModal(true)}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={scrollToLetterTypes}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-us" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? We're here to help you get the professional legal 
              assistance you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Send className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">support@talk-to-my-lawyer.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Business Hours</p>
                    <p className="text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
                <Button className="w-full btn-professional">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Get Professional Legal Letters Today!
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied clients who have resolved their legal issues 
              with our professional letter service.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setShowPopup(false)
                  setShowAuthModal(true)
                }}
                className="btn-professional"
              >
                Get Started
              </Button>
              <Button
                onClick={() => setShowPopup(false)}
                variant="outline"
                className="btn-outline-modern"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
