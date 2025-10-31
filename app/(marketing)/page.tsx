"use client"

import { WorkSection } from "@/components/sections/work-section"
import { ServicesSection } from "@/components/sections/services-section"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"
import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, Shield, FileText, CheckCircle2, Award, Clock } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const scrollThrottleRef = useRef<number | undefined>(undefined)

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)
    }
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < 4) {
          scrollToSection(currentSection + 1)
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current) return

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: "instant",
        })

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const newSection = Math.round(scrollContainerRef.current.scrollLeft / sectionWidth)
        if (newSection !== currentSection) {
          setCurrentSection(newSection)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= 4) {
          setCurrentSection(newSection)
        }

        scrollThrottleRef.current = undefined
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection])

  return (
    <main className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Professional Header with Legal Theme */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <button
            onClick={() => scrollToSection(0)}
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Scale className="h-6 w-6 text-blue-900" />
            <span className="font-serif text-xl font-bold tracking-tight text-slate-900">Talk-To-My-Lawyer</span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {["Home", "How It Works", "Services", "Why Us", "Get Started"].map((item, index) => (
              <button
                key={item}
                onClick={() => scrollToSection(index)}
                className={`group relative font-sans text-sm font-medium transition-colors ${
                  currentSection === index ? "text-blue-900" : "text-slate-600 hover:text-blue-900"
                }`}
              >
                {item}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-blue-900 transition-all duration-300 ${
                    currentSection === index ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => router.push("/auth")}
            className="rounded-md bg-blue-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-800 hover:shadow-lg"
          >
            Client Portal
          </button>
        </div>
      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className="relative z-10 flex overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Professional Hero Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 px-6 pt-24 md:px-12">
          <div className="mx-auto max-w-6xl text-center">
            {/* Trust Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
              <Shield className="h-4 w-4 text-blue-900" />
              <span className="text-sm font-medium text-blue-900">Trusted Legal Document Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 font-serif text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
              Professional Legal Letters
              <br />
              <span className="text-blue-900">Made Simple</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Generate legally sound demand letters, notices, and responses with confidence. 
              Trusted by legal professionals and businesses nationwide.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => router.push("/auth")}
                className="group flex items-center gap-2 rounded-lg bg-blue-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-800 hover:shadow-xl"
              >
                <FileText className="h-5 w-5" />
                Create Your Letter Now
              </button>
              <button
                onClick={() => scrollToSection(1)}
                className="flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:border-blue-900 hover:bg-slate-50"
              >
                See How It Works
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { icon: CheckCircle2, label: "Legally Compliant", value: "100%" },
                { icon: Shield, label: "Secure & Private", value: "Bank-Level" },
                { icon: Award, label: "Client Satisfaction", value: "98%" },
                { icon: Clock, label: "Average Time", value: "5 mins" },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <item.icon className="h-6 w-6 text-blue-900" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-sm text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 flex animate-bounce flex-col items-center gap-2">
            <p className="text-sm text-slate-500">Scroll to learn more</p>
            <div className="h-8 w-5 rounded-full border-2 border-slate-300">
              <div className="mx-auto mt-1.5 h-2 w-1 animate-pulse rounded-full bg-slate-400" />
            </div>
          </div>
        </section>

        <WorkSection />
        <ServicesSection />
        <AboutSection scrollToSection={scrollToSection} />
        <ContactSection />
      </div>

      <style jsx global>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}
