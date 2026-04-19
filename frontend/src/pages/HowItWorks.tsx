import { motion } from "framer-motion"
import { Check, X, ChevronDown, Database, Layout, Server, Sparkles, Zap, Smartphone, ArrowRight, MapPin } from "lucide-react"
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

const stack = [
  { name: "React", desc: "Core UI component library", icon: Layout },
  { name: "TypeScript", desc: "Type-safe architecture", icon: Zap },
  { name: "Tailwind CSS", desc: "Utility-first styling", icon: Layout },
  { name: "Framer Motion", desc: "Fluid animations", icon: Sparkles },
  { name: "Recharts", desc: "Data visualization", icon: Zap },
  { name: "Lucide Icons", desc: "Premium iconography", icon: Smartphone }
];

export function HowItWorks() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="bg-[#F8FAFF] pt-12 pb-24 font-sans">
      {/* Hero & Process Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-24">
        <div className="bg-[#F4F7FF] rounded-[2.5rem] p-8 md:p-14 shadow-[0_12px_40px_rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.08)] relative overflow-hidden">
          {/* Abstract App Background Layer bleeding behind entire container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[80%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[100px]" />
            <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-10%] right-[30%] w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-[100px]" />
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12 relative z-10 w-full items-center">
            {/* Left Content */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-6 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                Launch smarter with AI
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">The Launch Process</h1>
              <p className="text-lg text-slate-500 mb-8 max-w-md">How we turn your idea into an actionable blueprint.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <button className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-bold shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  Get Started Free <ArrowRight size={16} />
                </button>
                <button className="bg-white text-slate-700 border border-[rgba(37,99,235,0.15)] px-8 py-3.5 rounded-full font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-slate-700 border-b-[5px] border-b-transparent"></div> Watch Demo
                </button>
              </div>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                {timelineSteps.slice(0, 4).map((step, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 pl-10 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Illustration */}
            <div className="flex-1 w-full relative hidden lg:block h-[600px] scale-[1.05] right-[-2%]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-[700px]">
                  
                  {/* Huge Desktop App Mockup in background */}
                  <div className="absolute top-[5%] left-[5%] right-[-10%] bottom-[15%] bg-white/40 backdrop-blur-xl rounded-[2rem] border-2 border-white shadow-[0_30px_80px_rgba(37,99,235,0.1)] overflow-hidden">
                    {/* Browser Top Bar */}
                    <div className="h-8 bg-white/60 border-b border-white/50 flex items-center px-4 gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    {/* Inner Map/Grid Content */}
                    <div className="absolute inset-0 mt-8 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20" />
                    <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[60px]" />
                    <div className="absolute bottom-[10%] right-[20%] w-[250px] h-[250px] bg-green-300/20 rounded-full blur-[50px]" />
                    
                    {/* Dashboard Lines / Abstract Paths */}
                    <div className="absolute inset-0 mt-8 opacity-30 flex items-center justify-center">
                      <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="none">
                        <path d="M50 150 Q150 50 250 150 T450 150" fill="none" stroke="#2563EB" strokeWidth="4" strokeDasharray="8 8" />
                        <path d="M100 250 Q200 100 350 200" fill="none" stroke="#2563EB" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Floating Abstract UI Mini Cards scattered */}
                  <motion.div className="absolute top-[12%] right-[10%] bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white flex items-center gap-2 z-10" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-500"><Layout size={12}/></div>
                    <div className="w-16 h-2 bg-slate-200 rounded-full" />
                  </motion.div>

                  <motion.div className="absolute top-[35%] left-0 bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white flex flex-col gap-2 z-10" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}>
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center text-green-500"><Database size={10}/></div>
                      <div className="w-12 h-2 bg-slate-200 rounded-full mt-1.5" />
                    </div>
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded bg-amber-100" />
                      <div className="w-16 h-2 bg-slate-200 rounded-full mt-1.5" />
                    </div>
                  </motion.div>
                  
                  {/* Giant Red Map Pin */}
                  <motion.div 
                    className="absolute top-[25%] right-[28%] bg-white p-4 rounded-3xl shadow-[0_12px_40px_rgba(239,68,68,0.2)] flex items-center justify-center z-20 border border-white"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                  >
                    <div className="p-3 bg-red-50 rounded-2xl text-red-500"><MapPin size={40} className="fill-red-100" /></div>
                  </motion.div>

                  {/* Main Chat Assistant Card Overlayed on top right */}
                  <div className="absolute bottom-[10%] right-[-5%] w-[340px] bg-white rounded-3xl p-6 shadow-[0_30px_70px_rgba(37,99,235,0.15)] border border-[rgba(37,99,235,0.06)] z-30">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-[0.8rem] bg-blue-600 flex items-center justify-center text-white"><Sparkles size={20}/></div>
                      <div>
                        <div className="font-extrabold text-slate-900 leading-tight">Launch Assistant</div>
                        <div className="text-xs text-green-500 font-semibold flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-[#F8FAFF] border border-[rgba(37,99,235,0.06)] rounded-2xl rounded-tl-sm p-4 text-slate-700 text-xs shadow-sm font-medium">
                        Start with a simple sentence e.g. "I want to open a salon in Pune."
                      </div>
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 text-xs shadow-[0_8px_20px_rgba(37,99,235,0.3)]">
                        I want to open a specialty coffee shop in Lucknow!
                      </div>
                    </div>
                  </div>
                  
                  {/* Modern Smartphone Mockup */}
                  <motion.div 
                    className="absolute bottom-[20%] left-[10%] w-[170px] h-[340px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[6px] border-slate-100 overflow-hidden flex flex-col z-20"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                  >
                    <div className="w-20 h-4 bg-slate-100 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-10" />
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-[45%] flex items-center justify-center relative border-b border-slate-100">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500">
                        <Layout size={24}/>
                      </div>
                    </div>
                    <div className="p-4 space-y-3.5 flex-1 bg-white relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-[10px]"><Zap size={10}/></div>
                        <div className="h-2 bg-slate-200 rounded flex-1"></div>
                      </div>
                      <div className="h-10 bg-blue-50/70 rounded-xl w-full"></div>
                      <div className="h-10 bg-blue-50/70 rounded-xl w-full"></div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-skeuo-white py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Why Alex-RTR?" />
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card variant="default" className="border-red-100 hover:shadow-md transition-shadow h-full">
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
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card variant="raised" className="relative overflow-hidden bg-white hover:shadow-[var(--shadow-skeuo-hover)] transition-shadow h-full">
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Architecture Visual */}
      <section className="max-w-5xl mx-auto px-4 py-24 mb-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Architecture & Engine</h2>
          <p className="text-slate-500">A look behind the scenes at our elegant architecture and premium technology stack.</p>
        </div>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_12px_40px_rgba(37,99,235,0.04)] border border-[rgba(37,99,235,0.06)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-50/80 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[rgba(37,99,235,0.06)] flex flex-col items-center flex-1 w-full relative">
              <Layout className="text-blue-500 mb-3" size={28} />
              <span className="font-bold text-slate-900 text-sm">Frontend UI</span>
            </div>
            
            <ArrowRight className="text-slate-300 hidden md:block shrink-0" size={20} />
            
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-[0_8px_24px_rgba(37,99,235,0.4)] flex flex-col items-center flex-1 w-full scale-105 z-10 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-2xl mix-blend-overlay"></div>
              <Sparkles className="mb-3 relative z-10" size={28} />
              <span className="font-black text-sm relative z-10 tracking-wide">AI Engine</span>
            </div>

            <ArrowRight className="text-slate-300 hidden md:block shrink-0" size={20} />
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[rgba(37,99,235,0.06)] flex flex-col items-center flex-1 w-full relative">
              <Database className="text-green-500 mb-3" size={28} />
              <span className="font-bold text-slate-900 text-sm">Local Data</span>
            </div>
            
            <ArrowRight className="text-slate-300 hidden md:block shrink-0" size={20} />

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[rgba(37,99,235,0.06)] flex flex-col items-center flex-1 w-full relative">
              <Server className="text-purple-500 mb-3" size={28} />
              <span className="font-bold text-slate-900 text-sm">Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <SectionHeading title="The Technology Stack" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stack.map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5, scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-start gap-4 hover:shadow-[var(--shadow-skeuo-hover)] transition-all duration-300 cursor-default"
            >
              <div className="bg-white p-3 rounded-xl shadow-sm"><item.icon size={20} className="text-blue-600"/></div>
              <div>
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-24 bg-skeuo-white rounded-t-3xl">
        <SectionHeading title="Frequently Asked Questions" />
        <div className="space-y-4">
          {mockFAQs.map((faq, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
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
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
