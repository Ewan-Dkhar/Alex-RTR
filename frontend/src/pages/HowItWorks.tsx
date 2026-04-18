import { motion } from "framer-motion"
import { Check, X, ChevronDown } from "lucide-react"
import { SectionHeading } from "../components/ui/SectionHeading"
import { Card } from "../components/ui/Card"
import { mockFAQs } from "../data/mockData"
import { useState } from "react"

const timelineSteps = [
  { title: "Enter business idea", desc: "Start with a simple sentence e.g., 'I want to open a salon in Pune.'" },
  { title: "AI finds missing info", desc: "Our models analyze your idea and identify missing parameters like budget and area." },
  { title: "Conversational onboarding", desc: "Answer simple follow-up questions in our chat interface." },
  { title: "AI planning engine runs", desc: "The AI synthesizes your answers and builds a structural model." },
  { title: "Local data enriches outputs", desc: "Real estate and vendor data specific to your city are pulled in." },
  { title: "Receive launch roadmap", desc: "Get a downloadable report with your budget, pricing strategy, and vendor matches." }
];

export function HowItWorks() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-white pt-12 pb-24">
      {/* Timeline Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-24">
        <SectionHeading title="The Launch Process" subtitle="How we turn your idea into an actionable blueprint." />
        <div className="relative border-l-2 border-blue-100 ml-4 md:ml-1/2">
          {timelineSteps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1 }}
              className="mb-10 ml-8 relative"
            >
              <div className="absolute -left-[41px] top-1 px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-xs shadow-sm shadow-blue-200">
                {idx + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-skeuo-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Why Alex-RTR?" />
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card variant="default" className="border-red-100">
              <div className="text-gray-500 font-semibold mb-6 flex items-center justify-between">
                Generic AI Chatbot
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500"><X size={16}/></div>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 text-gray-600"><X className="text-red-400 shrink-0 mt-0.5" size={18}/> Generic, templated responses</li>
                <li className="flex gap-3 text-gray-600"><X className="text-red-400 shrink-0 mt-0.5" size={18}/> No business context modeling</li>
                <li className="flex gap-3 text-gray-600"><X className="text-red-400 shrink-0 mt-0.5" size={18}/> Generic worldwide data, no local context</li>
                <li className="flex gap-3 text-gray-600"><X className="text-red-400 shrink-0 mt-0.5" size={18}/> No visual dashboards or structure</li>
              </ul>
            </Card>

            <Card variant="raised" className="relative overflow-hidden bg-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <div className="text-blue-600 font-bold text-lg mb-6 flex items-center justify-between relative z-10">
                Alex-RTR
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm"><Check size={16}/></div>
              </div>
              <ul className="space-y-4 relative z-10">
                <li className="flex gap-3 text-gray-800 font-medium"><Check className="text-blue-500 shrink-0 mt-0.5" size={18}/> Asks smart clarifying questions</li>
                <li className="flex gap-3 text-gray-800 font-medium"><Check className="text-blue-500 shrink-0 mt-0.5" size={18}/> Tailored financial outputs</li>
                <li className="flex gap-3 text-gray-800 font-medium"><Check className="text-blue-500 shrink-0 mt-0.5" size={18}/> Local vendor routing (RAG pipeline)</li>
                <li className="flex gap-3 text-gray-800 font-medium"><Check className="text-blue-500 shrink-0 mt-0.5" size={18}/> Comprehensive startup roadmap UI</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-24">
        <SectionHeading title="Frequently Asked Questions" />
        <div className="space-y-4">
          {mockFAQs.map((faq, idx) => (
            <div key={idx} className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <button 
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-gray-900"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                {faq.question}
                <ChevronDown className={`transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} size={18} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
