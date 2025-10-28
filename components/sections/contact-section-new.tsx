"use client"

import { useReveal } from "@/hooks/use-reveal"
import { MagneticButton } from "@/components/magnetic-button"

export function ContactSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-4xl text-center">
        <div
          className={`mb-8 transition-all duration-700 md:mb-12 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-4 font-sans text-4xl font-light leading-[1.05] tracking-tight text-foreground md:mb-6 md:text-7xl lg:text-8xl">
            Ready to Create Your
            <br />
            Legal Letter?
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/80 md:text-xl">
            Join thousands of users who trust Law Letter AI for their legal document needs.
          </p>
        </div>

        <div
          className={`flex flex-col items-center gap-4 transition-all duration-700 md:gap-6 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <MagneticButton size="lg" variant="primary" className="w-full max-w-md">
            Get Started Now
          </MagneticButton>
          <MagneticButton size="lg" variant="secondary" className="w-full max-w-md">
            Already have an account?
          </MagneticButton>
        </div>

        <div
          className={`mt-12 border-t border-foreground/10 pt-8 transition-all duration-700 md:mt-16 md:pt-12 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/15">
              <span className="font-sans text-sm font-bold text-foreground">L</span>
            </div>
            <span className="font-sans text-lg font-semibold text-foreground">Law Letter AI</span>
          </div>
          <p className="font-mono text-xs text-foreground/60 md:text-sm">
            © 2025 Law Letter AI. Professional legal document generation powered by AI.
          </p>
        </div>
      </div>
    </section>
  )
}
