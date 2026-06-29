'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import {
  ShieldCheck, CreditCard, Smartphone, CheckCircle2, Lock, Music, ArrowLeft, Loader2
} from 'lucide-react'

function PaymentForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const courseId     = params.get('courseId') ?? ''
  const courseTitle  = params.get('title') ?? 'Course'
  const price        = Number(params.get('price') ?? 0)
  const teacherName  = params.get('teacher') ?? ''

  const [method, setMethod]   = useState<'card' | 'upi'>('card')
  const [paying, setPaying]   = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  // Card fields
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  // UPI field
  const [upi, setUpi]   = useState('')

  const handlePay = async () => {
    setError('')
    if (method === 'card') {
      if (!card.number || !card.expiry || !card.cvv || !card.name) {
        setError('Please fill all card details'); return
      }
    } else {
      if (!upi.includes('@')) { setError('Enter a valid UPI ID (e.g. name@upi)'); return }
    }
    setPaying(true)
    try {
      const paymentRef = method === 'card'
        ? `CARD-MOCK-${Date.now()}-${card.number.slice(-4)}`
        : `UPI-MOCK-${Date.now()}-${upi}`

      await api.courses.enroll(courseId, { paymentRef, paidAmount: price })
      setDone(true)
    } catch (e: any) {
      setError(e?.message ?? 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (!courseId) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500">Invalid payment link.</p>
          <button onClick={() => router.push('/marketplace')} className="mt-4 text-amber-700 text-sm font-semibold">
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600"/>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">Payment Successful!</h2>
          <p className="text-stone-500 text-sm mb-1">You are now enrolled in</p>
          <p className="font-semibold text-stone-800 mb-6">{courseTitle}</p>
          <div className="bg-stone-50 rounded-xl p-4 text-left mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-500">Amount paid</span>
              <span className="font-bold text-stone-800">₹{price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Status</span>
              <span className="text-green-700 font-semibold">Confirmed</span>
            </div>
          </div>
          <button onClick={() => router.push('/student')}
            className="w-full bg-amber-700 hover:bg-amber-600 text-white py-3 rounded-2xl font-semibold transition-colors">
            Go to My Dashboard
          </button>
          <button onClick={() => router.push('/student/classes')}
            className="w-full mt-3 border border-stone-200 text-stone-700 py-3 rounded-2xl font-semibold transition-colors text-sm hover:border-amber-300">
            View My Classes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 bg-white border border-stone-200 rounded-xl flex items-center justify-center hover:border-amber-300 transition-colors">
            <ArrowLeft size={16} className="text-stone-600"/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-900 rounded-lg flex items-center justify-center">
              <Music size={13} className="text-amber-300"/>
            </div>
            <span className="font-serif font-bold text-stone-900">Swara Sangam</span>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm mb-4">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Order Summary</h3>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <Music size={16} className="text-amber-300"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-800 text-sm leading-tight">{courseTitle}</p>
              {teacherName && <p className="text-xs text-stone-400 mt-0.5">by {teacherName}</p>}
            </div>
          </div>
          <div className="border-t border-stone-100 mt-4 pt-4 flex items-center justify-between">
            <span className="text-stone-500 text-sm">Total</span>
            <span className="text-2xl font-serif font-bold text-stone-900">₹{price.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment method tabs */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="flex border-b border-stone-100">
            <button onClick={() => setMethod('card')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${method === 'card' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600' : 'text-stone-500 hover:text-stone-700'}`}>
              <CreditCard size={15}/> Card
            </button>
            <button onClick={() => setMethod('upi')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${method === 'upi' ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-600' : 'text-stone-500 hover:text-stone-700'}`}>
              <Smartphone size={15}/> UPI
            </button>
          </div>

          <div className="p-5 space-y-4">
            {method === 'card' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Card Number</label>
                  <input
                    value={card.number} maxLength={19}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16)
                      setCard(p => ({ ...p, number: v.replace(/(.{4})/g, '$1 ').trim() }))
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none font-mono tracking-widest"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Expiry</label>
                    <input
                      value={card.expiry} maxLength={5}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setCard(p => ({ ...p, expiry: v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v }))
                      }}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none font-mono"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">CVV</label>
                    <input
                      value={card.cvv} maxLength={3} type="password"
                      onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      placeholder="•••"
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none font-mono"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Name on Card</label>
                  <input
                    value={card.name}
                    onChange={e => setCard(p => ({ ...p, name: e.target.value }))}
                    placeholder="Full name as on card"
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none"/>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">UPI ID</label>
                <input
                  value={upi}
                  onChange={e => setUpi(e.target.value)}
                  placeholder="yourname@upi or yourname@okaxis"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:border-amber-400 focus:outline-none"/>
                <p className="text-xs text-stone-400 mt-2">Examples: name@paytm, name@ybl, name@okicici</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <button onClick={handlePay} disabled={paying}
          className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-70 text-white py-4 rounded-2xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg">
          {paying ? (
            <><Loader2 size={18} className="animate-spin"/> Processing…</>
          ) : (
            <><Lock size={16}/> Pay ₹{price.toLocaleString('en-IN')} Securely</>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-stone-400">
          <ShieldCheck size={13} className="text-green-500"/>
          <span>256-bit SSL encrypted · Demo payment (no real charge)</span>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"/></div>}>
      <PaymentForm />
    </Suspense>
  )
}
