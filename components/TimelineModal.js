import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { 
  X, 
  Download, 
  Mail, 
  Send, 
  PlayCircle, 
  UserCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react'
import jsPDF from 'jspdf'

export const TimelineModal = ({ isOpen, onClose, letterId, subscriptionInfo }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [letterData, setLetterData] = useState(null)
  const [sendingMethod, setSendingMethod] = useState(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const steps = [
    { id: 1, title: "Your Letter Is Being Generated", description: "AI is creating your professional letter", icon: PlayCircle },
    { id: 2, title: "Under Attorney Review", description: "Legal expert reviewing your letter", icon: UserCheck },
    { id: 3, title: "Ready for Delivery", description: "Download or send to recipient", icon: Send }
  ]

  // Auto-advance timeline
  useEffect(() => {
    if (isOpen && letterId) {
      // Step 1: Immediate
      setCurrentStep(1)
      
      // Step 2: After 2 seconds (simulated)
      setTimeout(() => {
        setCurrentStep(2)
        // Send email notification for step 2
        sendTimelineEmail(2)
      }, 2000)
      
      // Step 3: After 4 seconds (simulated - in real app would be 2 hours)
      setTimeout(() => {
        setCurrentStep(3)
        // Fetch letter data
        fetchLetterData()
      }, 4000)
    }
  }, [isOpen, letterId])

  const sendTimelineEmail = async (step) => {
    try {
      await fetch('/api/notifications/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letterId,
          step,
          subscriptionInfo
        })
      })
    } catch (error) {
      console.error('Error sending timeline email:', error)
    }
  }

  const fetchLetterData = async () => {
    try {
      const response = await fetch(`/api/letters/${letterId}`)
      if (response.ok) {
        const data = await response.json()
        setLetterData(data.letter)
      }
    } catch (error) {
      console.error('Error fetching letter:', error)
    }
  }

  const handleDownload = () => {
    if (!letterData) return
    
    const doc = new jsPDF()
    const lines = letterData.content.split('\n')
    let y = 20
    
    lines.forEach(line => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, 20, y)
      y += 7
    })
    
    doc.save(`${letterData.title}.pdf`)
  }

  const handleSendEmail = async () => {
    if (!recipientEmail || !letterData) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/letters/${letterId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail })
      })
      
      if (response.ok) {
        toast.success('Letter sent successfully!')
        onClose()
      } else {
        toast.error('Failed to send letter')
      }
    } catch (error) {
      toast.error('Error sending letter')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMail = async () => {
    if (!recipientAddress || !letterData) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/letters/send-physical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          letterId, 
          recipientAddress,
          additionalFee: 25 
        })
      })
      
      if (response.ok) {
        toast.success('Physical mail order placed! ($25 fee applied)')
        onClose()
      } else {
        toast.error('Failed to process mail order')
      }
    } catch (error) {
      toast.error('Error processing mail order')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-blue-600">Letter Processing Status</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Track your letter's progress through our professional review process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline */}
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.id 
                    ? 'bg-green-100 border-green-500 text-green-600' 
                    : currentStep === step.id 
                    ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : currentStep === step.id ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    currentStep >= step.id ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Options - Only show when step 3 is reached */}
          {currentStep >= 3 && letterData && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Choose Delivery Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSendingMethod('download')}>
                  <CardContent className="p-4 text-center">
                    <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold">Download PDF</h4>
                    <p className="text-sm text-gray-600">Get your letter instantly</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSendingMethod('email')}>
                  <CardContent className="p-4 text-center">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold">Send via Email</h4>
                    <p className="text-sm text-gray-600">Email directly to recipient</p>
                  </CardContent>
                </Card>
              </div>
              <Card className="mt-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSendingMethod('mail')}>
                <CardContent className="p-4 text-center">
                  <Send className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-semibold">Send Physical Mail <span className="text-sm text-orange-600">(+$25)</span></h4>
                  <p className="text-sm text-gray-600">We'll mail it for you with tracking</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Delivery Method Forms */}
          {sendingMethod === 'download' && (
            <div className="space-y-4">
              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download Letter PDF
              </Button>
            </div>
          )}

          {sendingMethod === 'email' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleSendEmail} disabled={loading || !recipientEmail} className="w-full" size="lg">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                Send Letter via Email
              </Button>
            </div>
          )}

          {sendingMethod === 'mail' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipientAddress">Recipient Address</Label>
                <Textarea
                  id="recipientAddress"
                  placeholder="Full mailing address including ZIP code"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-700">
                  <strong>Additional Fee:</strong> $25 for physical mail service with tracking
                </p>
              </div>
              <Button onClick={handleSendMail} disabled={loading || !recipientAddress} className="w-full" size="lg">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Physical Mail (+$25)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
