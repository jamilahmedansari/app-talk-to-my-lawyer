"use client"

import { useReveal } from "@/hooks/use-reveal"

export function WorkSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Left side - Heading */}
          <div>
            <div
              className={`mb-6 transition-all duration-700 md:mb-12 ${
                isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
              }`}
            >
              <h2 className="mb-3 font-sans text-3xl font-light leading-[1.1] tracking-tight text-foreground md:mb-4 md:text-6xl lg:text-7xl">
                How it
                <br />
                <span className="text-foreground/40">works</span>
              </h2>
            </div>

            <div
              className={`space-y-3 transition-all duration-700 md:space-y-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <p className="max-w-md text-sm leading-relaxed text-foreground/90 md:text-lg">
                Creating professional legal documents has never been easier. Our platform guides you through
                every step.
              </p>
            </div>
          </div>

          {/* Right side - Steps */}
          <div className="flex items-center">
            <div className="w-full space-y-4 md:space-y-6">
              {[
                {
                  number: "01",
                  title: "Choose Your Letter Type",
                  description: "Select from demand letters, notices, or responses based on your needs",
                },
                {
                  number: "02",
                  title: "Fill in the Details",
                  description: "Our smart form guides you through the required information with helpful tips",
                },
                {
                  number: "03",
                  title: "Review & Download",
                  description: "Get your professionally formatted legal document ready to send in minutes",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="group relative overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/10 md:p-8">
                    <div className="relative z-10">
                      <div className="mb-3 font-mono text-sm text-foreground/60 md:mb-4">{step.number}</div>
                      <h3 className="mb-2 text-xl font-light text-foreground md:text-2xl">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-foreground/70 md:text-base">{step.description}</p>
                    </div>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
