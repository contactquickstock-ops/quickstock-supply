import CustomerLayout from '../../layouts/CustomerLayout'

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'We offer same-day delivery within business hours (8:00 AM – 8:00 PM). Orders placed after 8:00 PM will be delivered the next business day.',
  },
  {
    q: 'Is there a minimum order amount?',
    a: 'There is no minimum order amount. However, orders below ₱500 incur a ₱25 delivery fee. Orders ₱500 and above enjoy FREE delivery — even without a membership.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We only accept Cash on Delivery (COD). Pay in cash when your order arrives at your door. No advance payment is required.',
  },
  {
    q: 'How do I earn reward points?',
    a: 'Only active Premium Members earn reward points — 1 point for every ₱100 spent. Points are credited automatically once your order is delivered.',
  },
  {
    q: 'How does Premium Membership work?',
    a: 'Premium Membership costs ₱1,500 for the first 2 years. Renewal is ₱1,000/year. Members earn reward points on every delivered order. Apply through the Membership tab and upload your proof of payment.',
  },
  {
    q: 'What happens to my points if my membership expires?',
    a: 'Your existing points remain valid and can still be redeemed even after your membership expires. However, you will stop earning new points until you renew.',
  },
  {
    q: 'When can I apply for membership renewal?',
    a: 'You can apply for renewal anytime within 30 days before your membership expires, or after it has already expired. Simply go to the Membership tab and click "Renew Now".',
  },
]

export default function CustomerFAQ() {
  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Find answers to common questions about orders, delivery, and membership.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }) => (
            <div key={q}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
              <h3 className="font-bold text-gray-800 text-sm flex items-start gap-2">
                <span className="w-5 h-5 bg-[#168AFF] text-white rounded-full flex items-center
                  justify-center text-xs font-black shrink-0 mt-0.5">?</span>
                {q}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed pl-7">{a}</p>
            </div>
          ))}
        </div>

      </div>
    </CustomerLayout>
  )
}
