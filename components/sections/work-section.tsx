"use client"

import { useReveal } from "@/hooks/use-reveal"
import { FileCheck, Edit3, Download } from "lucide-react"

export function WorkSection() {
  const { ref, isVisible } = useReveal(0.3)

  return (
    <section
      ref={ref}
      className="flex min-h-screen w-screen shrink-0 snap-start items-center bg-white px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
            }`}
          >
            <h2 className="mb-4 font-serif text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
              Creating professional legal documents has never been easier. Our streamlined process ensures accuracy and compliance.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              number: "01",
              icon: FileCheck,
              title: "Select Document Type",
              description: "Choose from demand letters, formal notices, or response letters tailored to your legal needs.",
              details: ["Demand Letters", "Notice Letters", "Response Letters", "Custom Templates"],
            },
            {
              number: "02",
              icon: Edit3,
              title: "Complete the Details",
              description: "Fill out our intelligent form with guided assistance and legal tips at every step.",
              details: ["Smart Form Fields", "Legal Guidance", "Auto-validation", "Save Progress"],
            },
            {
              number: "03",
              icon: Download,
              title: "Review & Download",
              description: "Receive your professionally formatted document, ready to send with complete confidence.",
              details: ["PDF Format", "Professional Layout", "Legally Compliant", "Instant Delivery"],
            },
          ].map((step, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${200 + index * 150}ms` }}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl">
                {/* Number Badge */}
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-mono text-lg font-bold text-blue-900">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <step.icon className="h-8 w-8 text-blue-900" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-2xl font-bold text-slate-900">{step.title}</h3>
                <p className="mb-6 leading-relaxed text-slate-600">{step.description}</p>

                {/* Feature List */}
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center gap-2 text-sm text-slate-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover Effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/0 via-blue-50/50 to-blue-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
