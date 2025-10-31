"use client"

import { useReveal } from "@/hooks/use-reveal"
import { AlertCircle, Mail, MessageSquare, CheckCircle2, Shield, Zap } from "lucide-react"

export function ServicesSection() {
  const { ref, isVisible } = useReveal(0.3)

  const services = [
    {
      icon: AlertCircle,
      title: "Demand Letters",
      description: "Professional demand letters for unpaid debts, property disputes, contract breaches, and debt collection.",
      features: [
        { icon: CheckCircle2, text: "Legally Binding Format" },
        { icon: Shield, text: "Compliance Verified" },
        { icon: Zap, text: "Instant Generation" },
      ],
      color: "blue",
    },
    {
      icon: Mail,
      title: "Notice Letters",
      description: "Formal notices for lease terminations, employment matters, legal notifications, and official communications.",
      features: [
        { icon: CheckCircle2, text: "Multiple Formats" },
        { icon: Shield, text: "Professional Tone" },
        { icon: Zap, text: "Quick Delivery" },
      ],
      color: "indigo",
    },
    {
      icon: MessageSquare,
      title: "Response Letters",
      description: "Strategic responses to legal demands, complaints, official notices, and legal correspondence.",
      features: [
        { icon: CheckCircle2, text: "Tactical Language" },
        { icon: Shield, text: "Legally Sound" },
        { icon: Zap, text: "Time-Sensitive" },
      ],
      color: "violet",
    },
  ]

  return (
    <section
      ref={ref}
      className="flex min-h-screen w-screen shrink-0 snap-start items-center bg-gradient-to-b from-slate-50 to-white px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Section Header */}
        <div
          className={`mb-16 text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <h2 className="mb-4 font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Our Legal Services
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
            Comprehensive legal document generation services tailored to your specific needs.
            Each document is crafted to meet professional legal standards.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${200 + index * 150}ms` }}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl">
                {/* Icon */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <service.icon className="h-8 w-8 text-blue-900" />
                </div>

                {/* Title & Description */}
                <h3 className="mb-4 text-2xl font-bold text-slate-900">{service.title}</h3>
                <p className="mb-6 leading-relaxed text-slate-600">{service.description}</p>

                {/* Features */}
                <div className="space-y-3 border-t border-slate-100 pt-6">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                        <feature.icon className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Gradient */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/0 via-blue-50/30 to-blue-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-16 text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
          style={{ transitionDelay: "650ms" }}
        >
          <p className="mb-6 text-lg text-slate-600">
            All documents are reviewed for legal compliance and formatted to professional standards.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-6 py-3">
            <Shield className="h-5 w-5 text-green-700" />
            <span className="text-sm font-semibold text-green-900">100% Legally Compliant Documents</span>
          </div>
        </div>
      </div>
    </section>
  )
}
