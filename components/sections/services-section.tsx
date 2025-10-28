"use client"

import { useReveal } from "@/hooks/use-reveal"

export function ServicesSection() {
  const { ref, isVisible } = useReveal(0.3)

  const services = [
    {
      title: "Demand Letters",
      description: "Professional demand letters for unpaid debts, property disputes, and contract breaches",
      features: ["Custom templates", "Legal formatting", "Instant generation"],
    },
    {
      title: "Notice Letters",
      description: "Formal notices for lease terminations, employment issues, and legal notifications",
      features: ["Multiple formats", "Compliance checked", "Professional tone"],
    },
    {
      title: "Response Letters",
      description: "Expert responses to legal demands, complaints, and official notices",
      features: ["Strategic language", "Time-sensitive", "Legally sound"],
    },
  ]

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start items-center px-4 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-8 transition-all duration-700 md:mb-16 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-3 font-sans text-3xl font-light leading-[1.1] tracking-tight text-foreground md:mb-4 md:text-6xl lg:text-7xl">
            Our
            <br />
            <span className="text-foreground/40">Services</span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground/90 md:text-lg">
            Professional legal documents. Generate accurate, legally-sound letters in minutes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="group relative h-full overflow-hidden rounded-xl border border-foreground/10 bg-foreground/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/10 md:p-8">
                <div className="relative z-10 flex h-full flex-col">
                  <h3 className="mb-3 text-xl font-light text-foreground md:mb-4 md:text-2xl">{service.title}</h3>
                  <p className="mb-4 flex-grow text-sm leading-relaxed text-foreground/70 md:mb-6 md:text-base">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-foreground/90">
                        <div className="h-1 w-1 rounded-full bg-foreground/60" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="absolute inset-0 -translate-y-full bg-gradient-to-b from-transparent via-foreground/5 to-transparent transition-transform duration-700 group-hover:translate-y-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
