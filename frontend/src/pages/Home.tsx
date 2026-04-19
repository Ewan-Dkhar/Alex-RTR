import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Play, CheckCircle2, Factory, Building2, MapPin, BadgeIndianRupee, Sparkles, Layout } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Card } from "../components/ui/Card"
import { SectionHeading } from "../components/ui/SectionHeading"
import { mockTestimonials } from "../data/mockData"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-[#F8FAFF]">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-blue-50/60 to-transparent pointer-events-none" />
        <div className="absolute top-[-10%] right-[-5%] w-[80%] h-[120%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        <div className="absolute top-[20%] right-[5%] w-[700px] h-[700px] bg-blue-300/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-300/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                Launch smarter with AI
              </div>
              <h1 className="text-5xl md:text-[4rem] font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                From Business Idea<br className="hidden md:block"/> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Opening Day</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Alex-RTR helps aspiring entrepreneurs launch local businesses using AI-guided planning, market data, and actionable roadmaps.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link to="/demo">
                  <Button size="lg" className="w-full sm:w-auto group rounded-full px-8 py-4">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto rounded-full px-8 py-4 bg-white/50 backdrop-blur-sm border-[rgba(37,99,235,0.1)]">
                    <Play className="mr-2 h-4 w-4" fill="currentColor" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> 5 min Planning</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Localized Results</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Startup Ready</div>
              </div>
            </motion.div>

            {/* Premium Mockup Layered Structure */}
            <motion.div 
              className="flex-1 w-full max-w-2xl lg:max-w-none relative mt-12 lg:mt-0 lg:ml-12 h-[550px] scale-[1.05]"
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-[650px]">
                  
                  {/* Huge Background Mockup representing abstract Map/Platform */}
                  <div className="absolute top-[5%] left-[5%] right-[-5%] bottom-[10%] bg-white/40 backdrop-blur-3xl rounded-[2rem] border-[3px] border-white/60 shadow-[0_30px_80px_rgba(37,99,235,0.08)] overflow-hidden">
                    <div className="h-8 bg-white/60 border-b border-white/50 flex items-center px-4 gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <div className="w-4 h-4 rounded bg-slate-200 ml-2 mt-0.5" />
                    </div>
                    {/* Inner Map Texture & Glowing Blurs */}
                    <div className="absolute inset-0 mt-8 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20" />
                    <div className="absolute top-[15%] left-[20%] w-[250px] h-[250px] bg-blue-400/20 rounded-full blur-[60px]" />
                    <div className="absolute bottom-[20%] right-[30%] w-[200px] h-[200px] bg-green-300/20 rounded-full blur-[50px]" />
                    {/* Abstract road paths */}
                    <svg className="absolute inset-0 mt-8 w-full h-full opacity-20" viewBox="0 0 500 300" preserveAspectRatio="none">
                      <path d="M-50 150 Q150 200 250 150 T550 50" fill="none" stroke="#2563EB" strokeWidth="12" strokeLinecap="round" opacity="0.3" />
                      <path d="M-50 150 Q150 200 250 150 T550 50" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
                      <path d="M100 350 Q200 150 350 200" fill="none" stroke="#10B981" strokeWidth="8" strokeDasharray="12 12" />
                    </svg>
                  </div>

                  {/* Abstract Storefront blocks */}
                  <motion.div className="absolute bottom-[25%] left-[15%] z-10 w-[180px] h-[140px] bg-white rounded-xl shadow-2xl border border-white/50 overflow-hidden flex flex-col"
                    animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
                    <div className="h-4 bg-slate-100 flex items-center justify-center">
                      <div className="w-8 h-1 bg-slate-200 rounded-full" />
                    </div>
                    {/* Canopy */}
                    <div className="flex h-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-blue-400' : 'bg-green-300'} rounded-b-md shadow-sm`} />
                      ))}
                    </div>
                    <div className="flex-1 flex p-2 gap-2">
                       <div className="flex-1 bg-blue-50/50 rounded-lg border border-blue-100/50" />
                       <div className="flex-1 bg-blue-50/50 rounded-lg border border-blue-100/50" />
                    </div>
                  </motion.div>

                  {/* Floating Giant Map Pin */}
                  <motion.div 
                    className="absolute top-[18%] right-[32%] bg-white p-3 rounded-[1.2rem] shadow-[0_15px_35px_rgba(239,68,68,0.2)] border border-white z-20"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.2 }}
                  >
                    <div className="w-14 h-14 bg-red-50 rounded-[1rem] flex items-center justify-center relative">
                      <MapPin size={40} className="text-red-500 fill-red-100" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-3 h-3 bg-white rounded-full shadow-sm" />
                    </div>
                  </motion.div>

                  {/* Main Chat Assistant Card overlaying bottom right */}
                  <div className="absolute bottom-[-5%] right-[-5%] w-[340px] bg-white/95 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_30px_80px_rgba(37,99,235,0.15)] border border-[rgba(37,99,235,0.06)] z-30">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-50">
                      <div className="w-12 h-12 rounded-[1rem] bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                        <Sparkles size={24}/>
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 leading-tight text-lg">Launch Assistant</div>
                        <div className="text-xs text-green-500 font-bold flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-[#F8FAFF] border border-[rgba(37,99,235,0.06)] rounded-2xl rounded-tl-sm p-4 text-slate-700 text-xs shadow-sm font-medium leading-relaxed">
                        Hi! I'm ready to help you launch. What type of business do you want to open?
                      </div>
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 ml-auto text-xs shadow-[0_8px_20px_rgba(37,99,235,0.3)] font-medium leading-relaxed w-[85%]">
                        I want to open a specialty coffee shop in Lucknow.
                      </div>
                      <div className="bg-[#F8FAFF] border border-[rgba(37,99,235,0.06)] rounded-2xl p-4 text-slate-500 text-xs shadow-sm italic leading-relaxed">
                        I've started creating localized cost estimates and vendor recommendations...
                      </div>
                    </div>
                  </div>

                  {/* Floating Abstract UI Mini Cards scattered */}
                  <motion.div className="absolute top-[35%] left-[8%] bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white flex flex-col gap-2 z-10" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1.5 }}>
                    <div className="flex gap-2">
                      <div className="w-4 h-4 rounded bg-amber-100 flex items-center justify-center"><div className="w-2 h-2 bg-amber-400 rounded-sm"/></div>
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full mt-1.5" />
                    </div>
                  </motion.div>
                  
                  <motion.div className="absolute top-[8%] right-[15%] bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white flex items-center gap-2 z-10" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}>
                    <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-blue-500"><Layout size={10}/></div>
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                  </motion.div>

                  {/* Budget Est Widget */}
                  <motion.div 
                    className="absolute bottom-[32%] left-[45%] bg-white p-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-[rgba(37,99,235,0.06)] z-30 min-w-[140px]"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <BadgeIndianRupee className="text-blue-500 h-4 w-4" />
                      <span className="font-bold text-slate-900 text-xs tracking-wide">Budget Est.</span>
                    </div>
                    <div className="text-xl font-black text-slate-900">₹12L - 18L</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-white py-10 overflow-hidden relative">
        <motion.div 
          className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {["Groq Powered", "RAG Enhanced", "Local Insights", "Business Focused"].map((badge, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-6 py-2.5 rounded-full bg-white border border-[rgba(37,99,235,0.08)] shadow-[0_2px_10px_rgba(37,99,235,0.04)] text-sm font-semibold text-slate-500 cursor-default"
            >
              {badge}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-[#F8FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Starting a business is overwhelming." 
            subtitle="Most aspiring founders get stuck in the planning phase because the required information is scattered, confusing, and hard to access."
          />
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { title: "Don't know startup cost", icon: BadgeIndianRupee },
              { title: "No supplier contacts", icon: Factory },
              { title: "Unsure best area", icon: MapPin },
              { title: "No clear roadmap", icon: Building2 }
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card variant="raised" className="text-center h-full flex flex-col items-center justify-center py-10 bg-white border-0 shadow-[0_8px_30px_rgba(37,99,235,0.04)] hover:shadow-[0_16px_40px_rgba(37,99,235,0.08)]">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-500 shadow-sm">
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading 
            title="Built for Local Commerce" 
            subtitle="Whether you're opening a cafe or a boutique gym, our models understand the specific nuances of your industry."
          />
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {["Coffee Shop", "Salon", "Gym", "Bakery", "Food Truck", "Boutique"].map((biz, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 text-center border border-[rgba(37,99,235,0.06)] shadow-[0_4px_16px_rgba(37,99,235,0.02)] cursor-pointer transition-all hover:bg-[#F8FAFF] hover:border-blue-200 hover:shadow-[0_8px_24px_rgba(37,99,235,0.08)]"
              >
                <div className="font-semibold text-slate-700">{biz}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#F8FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Loved by Local Founders" />
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {mockTestimonials.map((t, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card variant="raised" className="flex flex-col h-full hover:shadow-[var(--shadow-skeuo-hover)] transition-shadow duration-300">
                  <div className="flex mb-4 text-yellow-400">
                    {"★★★★★".split("").map((star, j) => <span key={j}>{star}</span>)}
                  </div>
                  <p className="text-gray-700 mb-6 flex-1 italic">"{t.text}"</p>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Ready to launch your idea?</h2>
          <p className="text-xl text-slate-600 mb-10">Stop guessing. Get your localized launch roadmap today.</p>
          <Link to="/demo">
            <Button size="lg" className="rounded-full px-10 py-4 shadow-[0_8px_20px_rgba(37,99,235,0.4)] text-lg">
              Try Live Demo
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
