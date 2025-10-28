"use client"

import { MagneticButton } from "@/components/magnetic-button"
import { useReveal } from "@/hooks/use-reveal"
import { useRouter } from "next/navigation"

export function ContactSection() {
  const { ref, isVisible } = useReveal(0.3)
  const router = useRouter()

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
                Ready to get
                <br />
                <span className="text-foreground/40">started?</span>
              </h2>
            </div>

            <div
              className={`space-y-3 transition-all duration-700 md:space-y-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <p className="max-w-md text-sm leading-relaxed text-foreground/90 md:text-lg">
                Join thousands of clients who trust Talk-To-My-Lawyer. Create your first professional legal document in
                minutes.
              </p>
            </div>

            <div
              className={`mt-6 flex flex-col gap-3 transition-all duration-700 md:mt-8 md:gap-4 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <MagneticButton variant="primary" size="lg" onClick={() => router.push('/auth')}>
                Start Creating Letters
              </MagneticButton>
              <MagneticButton variant="secondary" size="lg" onClick={() => router.push('/auth')}>
                Already have an account?
              </MagneticButton>
            </div>
          </div>

          {/* Right side - Info */}
          <div className="flex items-center">
            <div className="space-y-6 md:space-y-8">
              {[
                {
                  title: "Support",
                  description: "Get help from our team",
                  link: "support@talktomylawyer.com",
                },
                {
                  title: "Social",
                  description: "Follow us for updates",
                  link: "@talktomylawyer",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="group relative overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/10 md:p-8">
                    <div className="relative z-10">
                      <h3 className="mb-2 text-xl font-light text-foreground md:text-2xl">{item.title}</h3>
                      <p className="mb-2 text-sm text-foreground/70 md:text-base">{item.description}</p>
                      <p className="text-sm font-medium text-foreground/90 md:text-base">{item.link}</p>
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
