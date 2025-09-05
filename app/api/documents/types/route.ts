import { NextResponse } from 'next/server'

export async function GET() {
  // Mock document types - this could be expanded with a database table
  const categories = [
    {
      id: 'business',
      name: 'Business & Corporate',
      types: [
        { id: 'cease_desist', name: 'Cease and Desist Letter' },
        { id: 'contract_breach', name: 'Contract Breach Notice' },
        { id: 'employment_issue', name: 'Employment Issue Letter' },
        { id: 'intellectual_property', name: 'Intellectual Property Notice' }
      ]
    },
    {
      id: 'consumer',
      name: 'Consumer & Personal',
      types: [
        { id: 'debt_collection', name: 'Debt Collection Dispute' },
        { id: 'insurance_claim', name: 'Insurance Claim Letter' },
        { id: 'landlord_tenant', name: 'Landlord/Tenant Issue' },
        { id: 'product_liability', name: 'Product Liability Claim' }
      ]
    },
    {
      id: 'legal',
      name: 'Legal & Compliance',
      types: [
        { id: 'regulatory_compliance', name: 'Regulatory Compliance Notice' },
        { id: 'legal_demand', name: 'Legal Demand Letter' },
        { id: 'settlement_proposal', name: 'Settlement Proposal' },
        { id: 'mediation_request', name: 'Mediation Request' }
      ]
    }
  ]

  return NextResponse.json({ categories })
}