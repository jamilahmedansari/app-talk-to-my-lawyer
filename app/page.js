"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  User,
  Users,
  PenTool,
  Gift,
  Star,
  Mail,
  LogOut,
  FileText,
  TrendingUp,
  Award,
  Crown,
  Scale,
  CheckCircle,
  Download,
  Send,
  Phone,
  Clock,
  Copy,
  Building,
  AlertCircle,
  Sparkles,
  Zap,
  Globe,
  Heart,
  ArrowRight,
  Play,
  ChevronRight,
  X,
  Eye,
  Calendar,
  MessageSquare,
  CheckCheck,
  Users2,
  MapPin,
  Building2,
  UserCheck,
  Upload,
  ChevronLeft,
} from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import jsPDF from "jspdf"
import { v4 as uuidv4 } from "uuid"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

// Enhanced Professional Legal Services Landing Page
export default function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [activeTab, setActiveTab] = useState("login")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [letters, setLetters] = useState([])
  const [refreshLetters, setRefreshLetters] = useState(0)
  const [showPopup, setShowPopup] = useState(false)
  const [popupShown, setPopupShown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Scroll handling for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
      // Silently handle error for production
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

            // Fetch letters
            fetch("/api/letters", {
              headers: { Authorization: `Bearer ${savedToken}` },
            })
              .then((res) => res.json())
              .then((letterData) => {
                if (letterData.letters) {
                  setLetters(letterData.letters)
                }
              })
          }
        })
        .catch(() => {
          localStorage.removeItem("token")
        })
    }
  }, [])

  // If user is logged in, show appropriate dashboard
  if (user) {
    if (user.role === "admin") {
      return <AdminDashboard user={user} token={token} handleLogout={handleLogout} />
    } else if (user.role === "contractor") {
      return <RemoteEmployeeDashboard user={user} token={token} handleLogout={handleLogout} />
    } else {
      return (
        <UserDashboard
          user={user}
          token={token}
          letters={letters}
          handleLogout={handleLogout}
          createSubscriptionCheckout={createSubscriptionCheckout}
          loading={loading}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Particle Background */}
      <div className="particles-container absolute inset-0 pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
      </div>

      {/* Floating Orbs */}
      <div className="floating-orbs absolute inset-0 pointer-events-none">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Enhanced Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "nav-modern-scrolled backdrop-blur-xl bg-white/95 shadow-xl border-b border-white/20"
            : "nav-modern backdrop-blur-md bg-white/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="logo-glow relative">
                <Scale className="h-8 w-8 text-blue-600 animate-pulse-gentle" />
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-20 animate-ping"></div>
              </div>
              <h1 className="text-2xl font-bold text-gradient-brand tracking-tight">Talk-to-My-Lawyer</h1>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={scrollToWhyChooseUs}
                className="nav-item-modern text-gray-700 hover:text-blue-600 font-medium"
              >
                Why Choose Us
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="nav-item-modern text-gray-700 hover:text-blue-600 font-medium"
              >
                How It Works
              </button>
              <button
                onClick={scrollToLetterTypes}
                className="nav-item-modern text-gray-700 hover:text-blue-600 font-medium"
              >
                Services
              </button>
              <button
                onClick={scrollToContact}
                className="nav-item-modern text-gray-700 hover:text-blue-600 font-medium"
              >
                Contact
              </button>
              <Button onClick={() => setShowAuthModal(true)} className="btn-professional px-6 py-2 shimmer-effect">
                <User className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="hero-section relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slide-up-modern">
              <div className="space-y-6">
                <Badge
                  variant="outline"
                  className="badge-shimmer px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  Fast, Affordable, Zero-Hassle Business Conflict Resolution
                </Badge>

                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gradient-hero">
                  Professional Legal Letters for
                  <span className="block text-gradient-animated mt-2">Business Conflicts</span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Get expert-crafted legal letters to resolve business disputes, debt collection, contract issues, and
                  more. Professional attorney-reviewed correspondence delivered in 48 hours.
                </p>

                <div className="flex items-center space-x-6 text-lg">
                  <div className="flex items-center space-x-2 text-green-600 font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Starting at $79</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600 font-semibold">
                    <Clock className="h-5 w-5" />
                    <span>48-Hour Delivery</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="btn-professional h-14 px-8 text-lg font-semibold shimmer-effect"
                  onClick={() => setShowAuthModal(true)}
                >
                  <PenTool className="h-5 w-5 mr-2" />
                  Get Started Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-outline-modern h-14 px-8 text-lg font-semibold bg-transparent"
                  onClick={scrollToLetterTypes}
                >
                  <Play className="h-5 w-5 mr-2" />
                  View Services
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">10,000+</div>
                  <div className="text-sm text-gray-600">Letters Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">24hr</div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative animate-scale-in-modern stagger-modern-2">
              <div className="hero-image-container relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl animate-pulse-gentle"></div>
                <img
                  src="https://images.unsplash.com/photo-1662104935883-e9dd0619eaba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsYXd5ZXJ8ZW58MHx8fGJsdWV8MTc1MjM4OTk5OXww&ixlib=rb-4.1.0&q=85"
                  alt="Professional Legal Services"
                  className="hero-image relative z-10 w-full h-96 object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent rounded-3xl z-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-modern">
            <h2 className="text-4xl font-bold text-gradient-modern mb-6">Why Choose Us? This is a No-Brainer.</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've revolutionized legal letter services with cutting-edge technology and expert attorneys
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "48-Hour Turnaround",
                description: "Lightning-fast delivery without compromising quality",
                color: "blue",
              },
              {
                icon: FileText,
                title: "Professional PDF Letters",
                description: "Attorney-reviewed, legally sound documents",
                color: "green",
              },
              {
                icon: Zap,
                title: "Zero-Hassle Process",
                description: "Simple forms, automated workflow, instant results",
                color: "purple",
              },
              {
                icon: Users,
                title: "AI &#43; Attorney Power",
                description: "AI efficiency enhanced by legal expertise",
                color: "orange",
              },
              {
                icon: Award,
                title: "Top-Rated Attorneys",
                description: "Vetted legal professionals in your jurisdiction",
                color: "red",
              },
              {
                icon: MessageSquare,
                title: "Lightning Communication",
                description: "Real-time updates and instant support",
                color: "cyan",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`feature-card-enhanced hover-lift animate-slide-up-modern stagger-modern-${index + 1}`}
              >
                <CardContent className="p-8 text-center">
                  <div className={`feature-icon-wrapper mb-6 text-${feature.color}-600`}>
                    <feature.icon className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Section */}
          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600 mb-8">Trusted by thousands and featured in leading publications</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Building className="h-6 w-6" />
                <span className="font-semibold">Entrepreneur</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-6 w-6" />
                <span className="font-semibold">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6" />
                <span className="font-semibold">HackerNoon</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <span className="font-semibold">BuiltIn</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-6 w-6" />
                <span className="font-semibold">BluePryme</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-modern">
            <h2 className="text-4xl font-bold text-gradient-modern mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your professional legal letter in 5 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              {
                step: 1,
                title: "Submit Request",
                description: "Complete our detailed form with your case information",
                icon: FileText,
              },
              {
                step: 2,
                title: "Case Assignment",
                description: "Your case is assigned to a qualified attorney",
                icon: UserCheck,
              },
              {
                step: 3,
                title: "Attorney Review",
                description: "Expert legal review and letter drafting",
                icon: Scale,
              },
              {
                step: 4,
                title: "Quality Check",
                description: "Final review and client approval process",
                icon: CheckCheck,
              },
              {
                step: 5,
                title: "Delivery",
                description: "Professional letter delivered with support",
                icon: Send,
              },
            ].map((step, index) => (
              <div
                key={index}
                className={`process-step text-center animate-slide-up-modern stagger-modern-${index + 1}`}
              >
                <div className="process-step-icon mb-6">
                  <div className="step-number">{step.step}</div>
                  <step.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                {index < 4 && (
                  <div className="process-arrow hidden md:block">
                    <ArrowRight className="h-5 w-5 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Letter CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-slide-up-modern">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Request a Professional Letter Now</h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join thousands of satisfied clients who've resolved their business conflicts with our professional legal
              letters
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-blue-600 hover:bg-gray-50 h-14 px-8 text-lg font-semibold shimmer-effect"
              >
                <PenTool className="h-5 w-5 mr-2" />
                Start Your Letter Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-semibold bg-transparent"
                onClick={scrollToLetterTypes}
              >
                <Eye className="h-5 w-5 mr-2" />
                View Sample Letters
              </Button>
            </div>

            <p className="text-sm opacity-75">
              <a href="#" className="underline hover:text-blue-200 transition-colors">
                Read Terms & Conditions
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Letter Types Section */}
      <section id="letters" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-modern">
            <h2 className="text-4xl font-bold text-gradient-modern mb-6">Professional Letter Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive legal letter solutions for all your business conflicts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                type: "Debt Collection",
                icon: "💰",
                description: "Professional demand letters for outstanding payments and debt recovery",
                features: ["Payment demands", "Final notices", "Settlement offers", "Collection threats"],
              },
              {
                type: "Contract Disputes",
                icon: "📋",
                description: "Resolve contractual disagreements and enforce terms effectively",
                features: ["Breach notices", "Performance demands", "Remedy requests", "Termination letters"],
              },
              {
                type: "Employment Issues",
                icon: "👥",
                description: "Address workplace conflicts and employment-related disputes",
                features: ["Discrimination complaints", "Wage disputes", "Wrongful termination", "HR violations"],
              },
              {
                type: "Property Disputes",
                icon: "🏠",
                description: "Handle real estate conflicts and property-related issues",
                features: ["Tenant notices", "Boundary disputes", "Lease violations", "Property damage"],
              },
              {
                type: "Cease & Desist",
                icon: "⛔",
                description: "Stop unwanted behavior and protect your rights",
                features: ["Copyright infringement", "Trademark violations", "Harassment", "Defamation"],
              },
              {
                type: "Settlement Discussions",
                icon: "🤝",
                description: "Professional letters to initiate settlement negotiations",
                features: ["Settlement offers", "Mediation requests", "Compromise proposals", "Resolution terms"],
              },
            ].map((letter, index) => (
              <Card key={index} className={`letter-card-modern animate-slide-up-modern stagger-modern-${index + 1}`}>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">{letter.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 card-icon">{letter.type}</h3>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{letter.description}</p>
                  <ul className="space-y-2">
                    {letter.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reasons to Send Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-modern">
            <h2 className="text-4xl font-bold text-gradient-modern mb-6">Why Send a Professional Legal Letter?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Legal letters are powerful tools that often resolve disputes without expensive litigation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up-modern">
              {[
                {
                  title: "Immediate Attention",
                  description: "Professional legal letterhead commands respect and immediate response",
                  icon: AlertCircle,
                },
                {
                  title: "Cost-Effective Resolution",
                  description: "Resolve disputes for hundreds instead of thousands in legal fees",
                  icon: TrendingUp,
                },
                {
                  title: "Legal Documentation",
                  description: "Create official record of your demands and establish timeline",
                  icon: FileText,
                },
                {
                  title: "Settlement Leverage",
                  description: "Demonstrate seriousness and willingness to pursue legal action",
                  icon: Scale,
                },
              ].map((reason, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <reason.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{reason.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="animate-scale-in-modern stagger-modern-2">
              <img
                src="https://images.unsplash.com/photo-1662104935762-707db0439ecd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxsYXd5ZXJ8ZW58MHx8fGJsdWV8MTc1MjM4OTk5OXww&ixlib=rb-4.1.0&q=85"
                alt="Professional Legal Consultation"
                className="w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-us" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-modern">
            <h2 className="text-4xl font-bold text-gradient-modern mb-6">We're Here to Help</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions? Our expert team is ready to assist you with your legal letter needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8 animate-slide-up-modern">
              <Card className="card-modern p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Email Support</h3>
                      <p className="text-gray-600">support@talk-to-my-lawyer.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Phone Support</h3>
                      <p className="text-gray-600">1-800-LEGAL-HELP</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Business Hours</h3>
                      <p className="text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Headquarters</h3>
                      <p className="text-gray-600">New York, NY</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="card-modern p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join thousands of satisfied clients who've resolved their conflicts with our professional legal
                  letters.
                </p>
                <Button className="btn-professional w-full shimmer-effect" onClick={() => setShowAuthModal(true)}>
                  <PenTool className="h-5 w-5 mr-2" />
                  Start Your Letter Today
                </Button>
              </Card>
            </div>

            {/* Contact Image */}
            <div className="animate-scale-in-modern stagger-modern-2">
              <img
                src="https://images.pexels.com/photos/7841482/pexels-photo-7841482.jpeg"
                alt="Professional Business Meeting"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="footer-modern py-16 px-6 text-white relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Scale className="h-8 w-8 text-blue-400" />
                <h3 className="text-xl font-bold">Talk-to-My-Lawyer</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Professional legal letters for business conflicts. Fast, affordable, and effective.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Phone className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-300">Services</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Debt Collection
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contract Disputes
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Employment Issues
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Property Disputes
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-300">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-300">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Talk-to-My-Lawyer. All rights reserved. Serving thousands of clients since 2018.
            </p>
          </div>
        </div>
      </footer>

      {/* Engagement Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <Card className="modal-modern max-w-md w-full relative overflow-hidden animate-scale-in-modern">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50"></div>

            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 shadow-md border"
              onClick={() => setShowPopup(false)}
            >
              <X className="h-4 w-4 text-gray-600" />
            </Button>

            <CardHeader className="relative pb-4 pt-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gradient-modern">Need a Legal Letter?</CardTitle>
              <p className="text-gray-600 mt-2 font-medium">
                Professional attorney-reviewed letters delivered in 48 hours
              </p>
            </CardHeader>

            <CardContent className="relative px-8 pb-8">
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">48-hour delivery guaranteed</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Attorney-reviewed quality</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">95% success rate</span>
                </div>
              </div>

              <Button
                className="w-full btn-professional h-12 text-base font-semibold shimmer-effect mb-4"
                onClick={() => {
                  setShowPopup(false)
                  setTimeout(() => {
                    setShowAuthModal(true)
                  }, 300)
                }}
              >
                <PenTool className="h-5 w-5 mr-2" />
                Get Started Now
              </Button>

              <p className="text-xs text-gray-500 text-center">Starting at $79 • No hidden fees</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />}
    </div>
  )
}

// Enhanced Auth Modal Component
const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    couponCode: "",
  })
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        onAuthSuccess(data.user, data.token)
        toast.success("Login successful!")
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = registerData.couponCode ? "/api/auth/register-with-coupon" : "/api/auth/register"
      const payload = registerData.couponCode
        ? { ...registerData, coupon_code: registerData.couponCode } // Use coupon_code for backend
        : registerData

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        onAuthSuccess(data.user, data.token)
        toast.success("Registration successful!")
      } else {
        toast.error(data.error || "Registration failed")
      }
    } catch (error) {
      toast.error("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <Card className="modal-modern max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50"></div>

        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90 shadow-md border"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>

        <CardHeader className="relative pb-4 pt-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gradient-modern">
            {activeTab === "login" ? "Welcome Back" : "Join Our Community"}
          </CardTitle>
          <p className="text-gray-600 mt-2 font-medium">
            {activeTab === "login" ? "Sign in to access your legal letters" : "Create your account to get started"}
          </p>
        </CardHeader>

        <CardContent className="relative px-8 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 h-12 rounded-xl">
              <TabsTrigger
                value="login"
                className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-700 font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="input-modern h-12 text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-700 font-semibold">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="input-modern h-12 text-base"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-professional h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-gray-700 font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="register-name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="input-modern h-12 text-base"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-700 font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="input-modern h-12 text-base"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-700 font-semibold">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="input-modern h-12 text-base"
                    placeholder="Create a strong password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-role" className="text-gray-700 font-semibold">
                    Account Type
                  </Label>
                  <Select
                    value={registerData.role}
                    onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                  >
                    <SelectTrigger className="input-modern h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Personal User</SelectItem>
                      <SelectItem value="contractor">Business Contractor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-coupon" className="text-gray-700 font-semibold">
                    Referral Code (Optional)
                  </Label>
                  <Input
                    id="register-coupon"
                    value={registerData.couponCode}
                    onChange={(e) => setRegisterData({ ...registerData, couponCode: e.target.value })}
                    className="input-modern h-12 text-base"
                    placeholder="Enter referral code for discount"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-professional h-12 text-base font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <Sparkles className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-gray-500 text-center mt-8 leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// User Dashboard Component (keeping existing functionality)
// Admin Dashboard Component
const AdminDashboard = ({ user, token, handleLogout }) => {
  const [activeTab, setActiveTab] = useState("users")
  const [usersData, setUsersData] = useState([])
  const [remoteEmployeesData, setRemoteEmployeesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRemoteEmployees: 0,
    totalCouponUsage: 0,
    totalLetters: 0,
  })

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)

        // Fetch all users
        const usersResponse = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const usersData = await usersResponse.json()

        if (usersResponse.ok) {
          setUsersData(usersData.users)

          // Calculate stats
          const totalUsers = usersData.users.length
          const remoteEmployees = usersData.users.filter((user) => user.role === "contractor")
          // Note: referral_code is not directly on user in Prisma, it's subscriptionReferredBy
          // This might need adjustment if you want to track coupon usage directly from user model
          const totalCouponUsage = usersData.users.filter((user) => user.subscriptionReferredBy).length

          setStats((prev) => ({
            ...prev,
            totalUsers,
            totalRemoteEmployees: remoteEmployees.length,
            totalCouponUsage,
          }))

          // Get remote employees with their stats
          const remoteEmployeesWithStats = await Promise.all(
            remoteEmployees.map(async (employee) => {
              try {
                // Get contractor profile
                const contractorResponse = await fetch("/api/remote-employee/stats", {
                  headers: { Authorization: `Bearer ${token}` },
                })

                if (contractorResponse.ok) {
                  const contractorData = await contractorResponse.json()
                  return {
                    ...employee,
                    points: contractorData.points || 0,
                    total_signups: contractorData.total_signups || 0,
                    username:
                      contractorData.username || employee.name.toLowerCase().replace(/\s+/g, "").substring(0, 5),
                  }
                }
                return {
                  ...employee,
                  points: 0,
                  total_signups: 0,
                  username: employee.name.toLowerCase().replace(/\s+/g, "").substring(0, 5),
                }
              } catch (error) {
                // Silently handle error for production
                return {
                  ...employee,
                  points: 0,
                  total_signups: 0,
                  username: employee.name.toLowerCase().replace(/\s+/g, "").substring(0, 5),
                }
              }
            }),
          )

          setRemoteEmployeesData(remoteEmployeesWithStats)
        }

        // Fetch letters count
        const lettersResponse = await fetch("/api/admin/letters", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const lettersData = await lettersResponse.json()

        if (lettersResponse.ok) {
          setStats((prev) => ({
            ...prev,
            totalLetters: lettersData.letters.length,
          }))
        }
      } catch (error) {
        // Silently handle error for production
        toast.error("Failed to load admin data")
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [token])

  const getUsersByRole = (role) => {
    return usersData.filter((user) => user.role === role)
  }

  const getCouponUsageStats = () => {
    // Assuming subscriptionReferredBy indicates coupon usage
    const usersWithCoupons = usersData.filter((user) => user.subscriptionReferredBy)
    const totalDiscountUsed = usersWithCoupons.reduce((sum, user) => {
      // Assuming a fixed 20% discount for now, as per backend logic
      // If discount_percent is stored on user, use that instead
      return sum + (user.subscriptionDiscountPercent ? (user.subscriptionDiscountPercent / 100) * 100 : 0) // Placeholder for actual discount value
    }, 0)

    return {
      totalUsages: usersWithCoupons.length,
      totalDiscountUsed,
      averageDiscount: usersWithCoupons.length > 0 ? totalDiscountUsed / usersWithCoupons.length : 0,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-modern">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {user.name} - System Administrator</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remote Employees</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRemoteEmployees}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coupon Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCouponUsage}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Letters</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLetters}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-sm h-12">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users Management
            </TabsTrigger>
            <TabsTrigger value="remote-employees" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Remote Employees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersSection users={usersData} couponStats={getCouponUsageStats()} />
          </TabsContent>

          <TabsContent value="remote-employees">
            <RemoteEmployeesSection remoteEmployees={remoteEmployeesData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Users Section Component
const UsersSection = ({ users, couponStats }) => {
  const getUsersByRole = (role) => {
    return users.filter((user) => user.role === role)
  }

  const regularUsers = getUsersByRole("user")
  const contractors = getUsersByRole("contractor")
  const admins = getUsersByRole("admin")

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{regularUsers.length}</div>
              <div className="text-sm text-gray-600">Regular Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{contractors.length}</div>
              <div className="text-sm text-gray-600">Contractors</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{admins.length}</div>
              <div className="text-sm text-gray-600">Administrators</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Usage Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Coupon Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{couponStats.totalUsages}</div>
              <div className="text-sm text-gray-600">Total Coupon Uses</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">${couponStats.totalDiscountUsed.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Discount Given</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">${couponStats.averageDiscount.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Average Discount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Referred By</th> {/* Changed from Referral Code */}
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3 text-gray-600">{user.email}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : user.role === "contractor" ? "secondary" : "outline"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-600">{user.subscriptionReferredBy || "None"}</td>{" "}
                    {/* Changed from referral_code */}
                    <td className="p-3 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()} {/* Changed from created_at */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Remote Employees Section Component
const RemoteEmployeesSection = ({ remoteEmployees }) => {
  const totalSignups = remoteEmployees.reduce((sum, employee) => sum + (employee.total_signups || 0), 0)
  const totalPoints = remoteEmployees.reduce((sum, employee) => sum + (employee.points || 0), 0)

  return (
    <div className="space-y-6">
      {/* Remote Employee Statistics */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Remote Employee Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{remoteEmployees.length}</div>
              <div className="text-sm text-gray-600">Active Remote Employees</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalSignups}</div>
              <div className="text-sm text-gray-600">Total Signups Generated</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remote Employees Table */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Remote Employee Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Username/Code</th>
                  <th className="text-left p-3">Signups</th>
                  <th className="text-left p-3">Points</th>
                  <th className="text-left p-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {remoteEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{employee.name}</td>
                    <td className="p-3 text-gray-600">{employee.email}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{employee.username}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(employee.username)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{employee.total_signups || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">{employee.points || 0}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          (employee.total_signups || 0) > 10
                            ? "default"
                            : (employee.total_signups || 0) > 5
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {(employee.total_signups || 0) > 10
                          ? "Excellent"
                          : (employee.total_signups || 0) > 5
                            ? "Good"
                            : "New"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {remoteEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No remote employees found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Remote Employee Dashboard Component
const RemoteEmployeeDashboard = ({ user, token, handleLogout }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    points: 0,
    totalSignups: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/remote-employee/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        // Silently handle error for production
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-modern">Contractor Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-modern p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-green-600">{stats.points}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="card-modern p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Signups</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSignups}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="card-modern p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold text-purple-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="card-modern p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
            </div>
          ) : stats.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{activity.description}</span>
                  <span className="text-xs text-gray-500 ml-auto">{activity.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          )}
        </Card>
      </div>
    </div>
  )
}

const UserDashboard = ({ user, token, letters, handleLogout, createSubscriptionCheckout, loading }) => {
  const [activeTab, setActiveTab] = useState("generate")
  const [refreshLetters, setRefreshLetters] = useState(0)

  const fetchUpdatedLetters = async () => {
    setRefreshLetters((prev) => prev + 1)
  }

  const subscription = user.subscription || { status: "free", lettersRemaining: 0 }
  const hasActiveSubscription = subscription.status === "paid" && subscription.lettersRemaining > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-modern">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-1">Manage your legal letters and subscription</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-sm h-12">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Generate Letter
            </TabsTrigger>
            <TabsTrigger value="letters" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Letters
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <DetailedLetterGenerationForm
              user={user}
              token={token}
              subscription={subscription}
              onLetterGenerated={fetchUpdatedLetters}
            />
          </TabsContent>

          <TabsContent value="letters">
            <MyLettersSection letters={letters} refreshKey={refreshLetters} />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionManagement
              user={user}
              subscription={subscription}
              createSubscriptionCheckout={createSubscriptionCheckout}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Document Type Selection Component
const DocumentTypeSelector = ({ onSelect, selectedCategory, selectedType }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const response = await fetch("/api/documents/types")
        const data = await response.json()
        setCategories(data.categories)
      } catch (error) {
        // Silently handle error for production
      } finally {
        setLoading(false)
      }
    }

    fetchDocumentTypes()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading document types...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Document Type</h3>
        <p className="text-gray-600">Select the type of legal document you need</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                  <CardDescription className="text-xs">{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => onSelect(category.id, type.id, type.name)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id && selectedType === type.id
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Enhanced Document Generation Form
const DetailedLetterGenerationForm = ({ user, token, subscription, onLetterGenerated }) => {
  const [selectedCategory, setSelectedCategory] = useState("business_letters") // Default to business letters
  const [selectedType, setSelectedType] = useState("demand_letter") // Default to demand letter
  const [selectedTypeName, setSelectedTypeName] = useState("Demand Letter") // Default to Demand Letter
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    businessName: "",
    address: "",
    email: user?.email || "",
    phone: "",
    recipientName: "",
    businessName: "",
    address: "",
    email: user?.email || "",
    phone: "",
    recipientName: "",
    recipientBusinessName: "",
    recipientAddress: "",
    conflictType: "",
    conflictDetails: "",
    demand: "",
    deadline: "",
    additionalComments: "",
    urgencyLevel: "standard",
  })
  const [urgencyLevel, setUrgencyLevel] = useState("standard")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // Initialize currentStep
  const [uploadedFiles, setUploadedFiles] = useState([]) // Initialize uploadedFiles

  const conflictTypes = [
    "Debt Collection",
    "Breach of Contract",
    "Property Dispute",
    "Employment Issue",
    "Cease & Desist",
    "Settlement Discussion",
    "Other",
  ]

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map((file) => ({
      id: uuidv4(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploaded: false,
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const generateLetter = async () => {
    setLoading(true)
    try {
      // Construct the formData object for the API based on the current form fields
      const apiFormData = {
        fullName: formData.fullName,
        businessName: formData.businessName,
        yourAddress: formData.address,
        email: formData.email,
        phone: formData.phone,
        recipientName: formData.recipientName,
        recipientBusinessName: formData.recipientBusinessName,
        recipientAddress: formData.recipientAddress,
        briefDescription: formData.conflictType, // Mapping conflictType to briefDescription
        detailedInformation: formData.conflictDetails,
        whatToAchieve: formData.demand,
        timeframe: formData.deadline,
        consequences: formData.additionalComments, // Mapping additionalComments to consequences
      }

      const documentData = {
        title: `${selectedTypeName || "Generated Document"} - ${formData.recipientName || "No Recipient"}`, // Dynamic title
        documentType: selectedType, // Use selectedType from state
        category: selectedCategory, // Use selectedCategory from state
        formData: apiFormData, // Use the mapped form data
        urgencyLevel: urgencyLevel, // Use urgencyLevel from state
      }

      const response = await fetch("/api/documents/generate", {
        // Changed to new API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(documentData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Document generated successfully!")
        onLetterGenerated()
        // Reset form
        setCurrentStep(1)
        setFormData({
          fullName: user?.name || "",
          businessName: "",
          address: "",
          email: user?.email || "",
          phone: "",
          recipientName: "",
          recipientBusinessName: "",
          recipientAddress: "",
          conflictType: "",
          conflictDetails: "",
          demand: "",
          deadline: "",
          additionalComments: "",
          urgencyLevel: "standard",
        })
        setUploadedFiles([])
        setSelectedCategory("business_letters") // Reset to default
        setSelectedType("demand_letter") // Reset to default
        setSelectedTypeName("Demand Letter") // Reset to default
        setUrgencyLevel("standard") // Reset to default
      } else {
        toast.error(result.error || "Failed to generate document")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.address && formData.email && formData.phone
      case 2:
        return formData.recipientName && formData.recipientAddress
      case 3:
        return formData.conflictType && formData.conflictDetails
      case 4:
        return formData.demand && formData.deadline
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="card-modern">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <PenTool className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient-modern">Request Service Now</CardTitle>
          <p className="text-lg text-green-600 font-semibold mt-2">
            You pay nothing for this request! There's no charge and no obligation.
          </p>
          <p className="text-gray-600 mt-2 leading-relaxed">
            Let's see if we can help. Complete the form below to request a local law firm draft and deliver your letter.
            We'll handle the rest.
          </p>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-sm text-amber-700">
                <strong>Important:</strong> We receive hundreds of requests daily. Our team prioritizes cases based on
                urgency and completeness of information provided.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 5 && (
                    <div className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">Step {currentStep} of 5</div>
          </div>

          {/* Step 1: Your Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Information</h3>
              <p className="text-gray-600 mb-6">
                Provide your details so we can contact you and include them in the demand letter.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-gray-700 font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="input-modern h-12"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessName" className="text-gray-700 font-semibold">
                    Business Name (if applicable)
                  </Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    className="input-modern h-12"
                    placeholder="Enter your business name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-gray-700 font-semibold">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="input-modern"
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="input-modern h-12"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-semibold">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="input-modern h-12"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recipient Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recipient Information</h3>
              <p className="text-gray-600 mb-6">Tell us who will receive the demand letter.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientName" className="text-gray-700 font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange("recipientName", e.target.value)}
                    className="input-modern h-12"
                    placeholder="Enter recipient's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="recipientBusinessName" className="text-gray-700 font-semibold">
                    Business Name (if applicable)
                  </Label>
                  <Input
                    id="recipientBusinessName"
                    value={formData.recipientBusinessName}
                    onChange={(e) => handleInputChange("recipientBusinessName", e.target.value)}
                    className="input-modern h-12"
                    placeholder="Enter recipient's business name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recipientAddress" className="text-gray-700 font-semibold">
                  Address *
                </Label>
                <Textarea
                  id="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={(e) => handleInputChange("recipientAddress", e.target.value)}
                  className="input-modern"
                  placeholder="Enter recipient's complete address"
                  rows={3}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Describe the Conflict */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Describe the Conflict</h3>
              <p className="text-gray-600 mb-6">Help us understand the issue so we can craft an effective letter.</p>

              <div>
                <Label htmlFor="conflictType" className="text-gray-700 font-semibold">
                  Type of Conflict *
                </Label>
                <Select
                  value={formData.conflictType}
                  onValueChange={(value) => handleInputChange("conflictType", value)}
                >
                  <SelectTrigger className="input-modern h-12">
                    <SelectValue placeholder="Select conflict type" />
                  </SelectTrigger>
                  <SelectContent>
                    {conflictTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  Examples include unpaid invoices, contract disputes, partnership disagreements, intellectual property
                  issues, etc.
                </p>
              </div>

              <div>
                <Label htmlFor="conflictDetails" className="text-gray-700 font-semibold">
                  Detailed Description *
                </Label>
                <Textarea
                  id="conflictDetails"
                  value={formData.conflictDetails}
                  onChange={(e) => handleInputChange("conflictDetails", e.target.value)}
                  className="input-modern"
                  placeholder="Provide a detailed account of the issue, including relevant dates, amounts, and any previous attempts to resolve the conflict. Be as specific as possible."
                  rows={6}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 4: Your Demand */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Demand</h3>
              <p className="text-gray-600 mb-6">Specify what you want the recipient to do.</p>

              <div>
                <Label htmlFor="demand" className="text-gray-700 font-semibold">
                  What are you asking the recipient to do? *
                </Label>
                <Textarea
                  id="demand"
                  value={formData.demand}
                  onChange={(e) => handleInputChange("demand", e.target.value)}
                  className="input-modern"
                  placeholder="e.g., pay a specific amount, fulfill a contractual obligation, stop a certain behavior, etc."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="deadline" className="text-gray-700 font-semibold">
                  Deadline for Response *
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange("deadline", e.target.value)}
                  className="input-modern h-12"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 5: Additional Information */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Additional Information</h3>
              <p className="text-gray-600 mb-6">Include anything else that might help us generate your letter.</p>

              <div>
                <Label htmlFor="fileUpload" className="text-gray-700 font-semibold">
                  Supporting Documents
                </Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-blue-400 bg-transparent"
                    onClick={() => document.getElementById("fileUpload").click()}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Supporting Documents
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload any relevant documents, such as contracts, invoices, or correspondence.
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="additionalComments" className="text-gray-700 font-semibold">
                  Additional Comments
                </Label>
                <Textarea
                  id="additionalComments"
                  value={formData.additionalComments}
                  onChange={(e) => handleInputChange("additionalComments", e.target.value)}
                  className="input-modern"
                  placeholder="Any additional information or special requests"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t">
            <div className="flex items-center">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {subscription.status === "paid" && subscription.lettersRemaining > 0 && (
                <p className="text-sm text-gray-600">{subscription.lettersRemaining} letters remaining</p>
              )}

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="btn-professional flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={generateLetter}
                  disabled={loading || !isStepValid()}
                  className="btn-professional flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Generate Letter
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// My Letters Section Component
const MyLettersSection = ({ letters, refreshKey }) => {
  const [userLetters, setUserLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const token = localStorage.getItem("token")

  const fetchLetters = async () => {
    try {
      const response = await fetch("/api/letters", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUserLetters(data.letters || [])
      }
    } catch (error) {
      // Silently handle error for production
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLetters()
  }, [refreshKey])

  const downloadLetter = (letter) => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height
    const margin = 15

    // Title
    doc.setFontSize(16)
    doc.text(letter.title, margin, margin + 10)

    // Content
    doc.setFontSize(12)
    const splitContent = doc.splitTextToSize(letter.content, doc.internal.pageSize.width - 2 * margin)

    let yPos = margin + 25
    splitContent.forEach((line) => {
      if (yPos > pageHeight - margin) {
        doc.addPage()
        yPos = margin
      }
      doc.text(line, margin, yPos)
      yPos += 7
    })

    doc.save(`${letter.title}.pdf`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gradient-modern">My Letters</h3>
        <Badge variant="outline" className="px-3 py-1">
          {userLetters.length} Total Letters
        </Badge>
      </div>

      {userLetters.length === 0 ? (
        <Card className="card-modern p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No Letters Yet</h4>
          <p className="text-gray-500">Generate your first letter using the form above to get started.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userLetters.map((letter) => (
            <Card key={letter.id} className="card-modern p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{letter.title}</h4>
                    <Badge className={getStatusColor(letter.status)}>{letter.status}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(letter.createdAt)} {/* Changed from created_at */}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {letter.documentType || "General"} {/* Changed from letter_type */}
                    </span>
                    {letter.urgencyLevel && letter.urgencyLevel !== "standard" && (
                      <Badge variant="outline" className="text-xs">
                        {letter.urgencyLevel}
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-600 line-clamp-2 mb-4">{letter.content?.substring(0, 200)}...</p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLetter(letter)
                      setShowPreview(true)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLetter(letter)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Letter Preview Modal */}
      {showPreview && selectedLetter && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedLetter.title}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4">
              <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <strong>Created:</strong> {formatDate(selectedLetter.createdAt)}
                </div>
                <div className="text-sm">
                  <strong>Type:</strong> {selectedLetter.documentType || "General"}
                </div>
                <div className="text-sm">
                  <strong>Status:</strong>
                  <Badge className={`ml-2 ${getStatusColor(selectedLetter.status)}`}>{selectedLetter.status}</Badge>
                </div>
              </div>

              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed border p-4 rounded-lg bg-white">
                {selectedLetter.content}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
                <Button onClick={() => downloadLetter(selectedLetter)} className="btn-professional">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Subscription Management Component
const SubscriptionManagement = ({ user, subscription, createSubscriptionCheckout, loading }) => {
  const [currentPlan, setCurrentPlan] = useState(null)

  const subscriptionPlans = [
    {
      id: "4letters",
      name: "Starter Package",
      letters: 4,
      price: 199,
      description: "Perfect for small businesses",
      features: ["4 Professional Letters", "Attorney Review", "48-Hour Delivery", "Email Support"],
      popular: false,
    },
    {
      id: "6letters",
      name: "Professional Package",
      letters: 6,
      price: 279,
      description: "Most popular choice",
      features: [
        "6 Professional Letters",
        "Attorney Review",
        "24-Hour Delivery",
        "Priority Support",
        "Document Templates",
      ],
      popular: true,
    },
    {
      id: "8letters",
      name: "Business Package",
      letters: 8,
      price: 349,
      description: "For growing businesses",
      features: [
        "8 Professional Letters",
        "Senior Attorney Review",
        "12-Hour Delivery",
        "Priority Support",
        "Document Templates",
        "Legal Consultation",
      ],
      popular: false,
    },
  ]

  useEffect(() => {
    if (subscription?.packageType) {
      const plan = subscriptionPlans.find((p) => p.id === subscription.packageType)
      setCurrentPlan(plan)
    }
  }, [subscription])

  const formatPrice = (price) => {
    return (price / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
  }

  const getSubscriptionStatus = () => {
    if (subscription?.status === "paid" && subscription?.lettersRemaining > 0) {
      return {
        status: "active",
        message: `${subscription.lettersRemaining} letters remaining`,
        color: "text-green-600",
      }
    } else if (subscription?.status === "paid" && subscription?.lettersRemaining === 0) {
      return {
        status: "expired",
        message: "No letters remaining - Time to upgrade!",
        color: "text-amber-600",
      }
    } else {
      return {
        status: "free",
        message: "Free plan - Upgrade for full access",
        color: "text-gray-600",
      }
    }
  }

  const statusInfo = getSubscriptionStatus()

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      <Card className="card-modern p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gradient-modern">Current Subscription</h3>
          <Badge variant="outline" className={`px-3 py-1 ${statusInfo.color}`}>
            {statusInfo.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">{subscription?.lettersRemaining || 0}</div>
            <div className="text-sm text-gray-600">Letters Remaining</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">{currentPlan?.name || "Free Plan"}</div>
            <div className="text-sm text-gray-600">Current Package</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "N/A"}
            </div>
            <div className="text-sm text-gray-600">Renewal Date</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className={`text-center font-medium ${statusInfo.color}`}>{statusInfo.message}</p>
        </div>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h3 className="text-2xl font-bold text-gradient-modern mb-6 text-center">Choose Your Package</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`card-modern relative overflow-hidden ${plan.popular ? "border-2 border-blue-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <CardContent className={`p-6 ${plan.popular ? "pt-12" : ""}`}>
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{formatPrice(plan.price)}</div>
                  <div className="text-sm text-gray-500">{formatPrice(plan.price / plan.letters)} per letter</div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => createSubscriptionCheckout(plan.id)}
                  disabled={loading}
                  className={`w-full h-12 font-semibold ${plan.popular ? "btn-professional" : "btn-outline-modern"}`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : (
                    <>
                      {currentPlan?.id === plan.id ? "Current Plan" : "Select Plan"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Features */}
      <Card className="card-modern p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">Why Choose Our Professional Letters?</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <h5 className="font-semibold text-gray-800 mb-2">Attorney Reviewed</h5>
            <p className="text-sm text-gray-600">Every letter reviewed by licensed attorneys</p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h5 className="font-semibold text-gray-800 mb-2">Fast Delivery</h5>
            <p className="text-sm text-gray-600">Professional letters delivered within 48 hours</p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h5 className="font-semibold text-gray-800 mb-2">High Success Rate</h5>
            <p className="text-sm text-gray-600">95% of our letters achieve desired outcomes</p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-amber-600" />
            </div>
            <h5 className="font-semibold text-gray-800 mb-2">Satisfaction Guaranteed</h5>
            <p className="text-sm text-gray-600">100% satisfaction or money back guarantee</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
