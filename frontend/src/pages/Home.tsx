import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Play, CheckCircle2, Factory, Building2, MapPin, BadgeIndianRupee } from "lucide-react"
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
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-skeuo-white pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                Launch smarter with AI
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
                From Business Idea to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Opening Day</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Alex-RTR helps aspiring entrepreneurs launch local businesses using AI-guided planning, market data, and actionable roadmaps.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link to="/demo">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
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

            {/* Premium Mockup */}
            <motion.div 
              className="flex-1 w-full max-w-2xl lg:max-w-none"
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-skeuo)] border border-gray-100 z-20 relative">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">AI</div>
                      <div>
                        <div className="font-semibold text-gray-900">Launch Assistant</div>
                        <div className="text-xs text-green-500 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-gray-700 text-sm">
                      Hi! I'm ready to help you launch. What type of business do you want to open?
                    </div>
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] ml-auto text-sm shadow-md">
                      I want to open a specialty coffee shop in Lucknow.
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-gray-700 text-sm">
                      Great. Generating localized cost estimates and vendor recommendations...
                    </div>
                  </div>
                </div>

                {/* Floating Widgets */}
                <motion.div 
                  className="absolute -right-6 top-10 bg-white p-4 rounded-xl shadow-[var(--shadow-skeuo-hover)] border border-gray-100 z-30"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <BadgeIndianRupee className="text-blue-500 h-5 w-5" />
                    <span className="font-bold text-gray-900 text-sm">Budget Est.</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">₹12L - 18L</div>
                </motion.div>

                <motion.div 
                  className="absolute -left-8 bottom-10 bg-white p-4 rounded-xl shadow-[var(--shadow-skeuo-hover)] border border-gray-100 z-30 flex items-center gap-3"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                >
                  <MapPin className="text-red-500 h-5 w-5" />
                  <div>
                    <div className="font-bold text-gray-900 text-sm">Top Area</div>
                    <div className="text-xs text-gray-500">Gomti Nagar</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-gray-100 bg-white py-8 overflow-hidden">
        <motion.div 
          className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4 md:gap-8"
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
              className="px-5 py-2 rounded-full bg-gray-50 border border-gray-100 shadow-sm text-sm font-semibold text-gray-600 cursor-default"
            >
              {badge}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-skeuo-white">
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
                <Card variant="raised" className="text-center h-full flex flex-col items-center justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-600">
                    <item.icon />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
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
                className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100 shadow-sm cursor-pointer transition-colors hover:bg-blue-50 hover:shadow-md"
              >
                <div className="font-medium text-gray-800">{biz}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-skeuo-white">
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
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to launch your idea?</h2>
          <p className="text-xl text-gray-600 mb-10">Stop guessing. Get your localized launch roadmap today.</p>
          <Link to="/demo">
            <Button size="lg" className="shadow-[var(--shadow-skeuo-hover)] text-lg px-10">
              Try Live Demo
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
