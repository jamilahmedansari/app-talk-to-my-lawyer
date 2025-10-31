"use client"

import { useReveal } from "@/hooks/use-reveal"
import { useRouter } from "next/navigation"
import { Scale, Shield, Mail, Phone } from "lucide-react"

export function ContactSection() {
  const router = useRouter()
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex min-h-screen w-screen shrink-0 snap-start items-center bg-gradient-to-b from-slate-50 to-slate-100 px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Main CTA */}
        <div className="text-center">
          <div
            className={`mb-8 transition-all duration-700 md:mb-12 ${
              isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
            }`}
          >
            <h2 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Create your professional legal document in minutes. Join thousands of satisfied clients.
            </p>
          </div>

          <div
            className={`mb-16 flex flex-col items-center justify-center gap-4 transition-all duration-700 sm:flex-row ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <button
              onClick={() => router.push("/auth")}
              className="w-full max-w-sm rounded-lg bg-blue-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-800 hover:shadow-xl sm:w-auto"
            >
              Create Your Document Now
            </button>
            <button
              onClick={() => router.push("/auth")}
              className="w-full max-w-sm rounded-lg border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:border-blue-900 hover:bg-slate-50 sm:w-auto"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div
          className={`mb-16 grid grid-cols-1 gap-6 md:grid-cols-3 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          {[
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Bank-level encryption protects your data",
            },
            {
              icon: Scale,
              title: "Legally Compliant",
              description: "All documents meet legal standards",
            },
            {
              icon: Mail,
              title: "24/7 Support",
              description: "Expert assistance whenever you need it",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <item.icon className="h-6 w-6 text-blue-900" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`border-t border-slate-300 pt-8 transition-all duration-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-blue-900" />
              <span className="font-serif text-xl font-bold text-slate-900">Talk-To-My-Lawyer</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
              <button className="hover:text-blue-900">Privacy Policy</button>
              <button className="hover:text-blue-900">Terms of Service</button>
              <button className="hover:text-blue-900">Contact Support</button>
            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Talk-To-My-Lawyer. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
