export type ContactPipelineState = 'Contact' | 'Lead' | 'Customer' | 'Discarded'

export type ContactInterestLevel = 'Cold' | 'Warm' | 'Hot'

export type ContactSourceChannel = 'Instagram' | 'WhatsApp' | 'Referral' | 'Email' | 'Other'

export type CreateContactFormValues = {
  name: string
  phone?: string | null
  sourceChannel?: ContactSourceChannel | null
  interestLevel?: ContactInterestLevel | null
}
