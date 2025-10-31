"use client"

import { useReveal } from "@/hooks/use-reveal"
import { Users, TrendingUp, Clock, Award } from "lucide-react"

export function AboutSection({ scrollToSection }: { scrollToSection?: (index: number) => void }) {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex min-h-screen w-screen shrink-0 snap-start items-center bg-white px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Left side - Story */}
          <div className="flex flex-col justify-center">
            <div
              className={`mb-8 transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
              }`}
            >
              <h2 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
                Why Legal Professionals
                <br />
                <span className="text-blue-900">Trust Us</span>
              </h2>
            </div>

            <div
              className={`space-y-5 transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <p className="text-lg leading-relaxed text-slate-700">
                Talk-To-My-Lawyer combines legal expertise with cutting-edge technology to provide 
                professional-grade legal documents accessible to everyone.
              </p>
              <p className="text-lg leading-relaxed text-slate-600">
                Our platform is designed by legal professionals and technologists who understand 
                the importance of accuracy, compliance, and professionalism in legal documentation.
              </p>
              <p className="text-lg leading-relaxed text-slate-600">
                Whether you&apos;re a business owner, legal professional, or individual, our tools ensure 
                your legal correspondence meets the highest standards.
              </p>
            </div>

            <div
              className={`mt-8 transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <button
                onClick={() => scrollToSection?.(4)}
                className="rounded-lg bg-blue-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-800 hover:shadow-xl"
              >
                Start Creating Documents
              </button>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="flex items-center">
            <div className="grid w-full gap-6">
              {[
                { 
                  icon: Users,
                  number: "50,000+", 
                  label: "Documents Generated",
                  description: "Trusted by thousands nationwide"
                },
                { 
                  icon: Award,
                  number: "98%", 
                  label: "Client Satisfaction",
                  description: "Consistently high ratings"
                },
                { 
                  icon: Clock,
                  number: "5 Minutes", 
                  label: "Average Completion Time",
                  description: "Fast and efficient process"
                },
                { 
                  icon: TrendingUp,
                  number: "100%", 
                  label: "Legal Compliance",
                  description: "Every document verified"
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <stat.icon className="h-6 w-6 text-blue-900" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-serif text-3xl font-bold leading-none text-slate-900 md:text-4xl">
                          {stat.number}
                        </h3>
                        <p className="mb-1 text-base font-semibold text-slate-700">{stat.label}</p>
                        <p className="text-sm text-slate-500">{stat.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
