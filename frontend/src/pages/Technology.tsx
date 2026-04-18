import { motion } from "framer-motion"
import { Database, Layout, Server, Sparkles, Zap, Smartphone, ArrowRight } from "lucide-react"
import { SectionHeading } from "../components/ui/SectionHeading"
import { Card } from "../components/ui/Card"

const stack = [
  { name: "React", desc: "Core UI component library", icon: Layout },
  { name: "TypeScript", desc: "Type-safe architecture", icon: Zap },
  { name: "Tailwind CSS", desc: "Utility-first styling", icon: Layout },
  { name: "Framer Motion", desc: "Fluid animations", icon: Sparkles },
  { name: "Recharts", desc: "Data visualization", icon: Zap },
  { name: "Lucide Icons", desc: "Premium iconography", icon: Smartphone }
]

export function Technology() {
  return (
    <div className="bg-white pt-12 pb-24">
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How Alex-RTR Works</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A look behind the scenes at our elegant architecture and premium technology stack.
        </p>
      </section>

      {/* Architecture Visual */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <Card variant="raised" className="p-8 md:p-12 relative overflow-hidden bg-skeuo-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center w-full md:w-32">
              <Layout className="text-blue-500 mb-2" size={28} />
              <span className="font-semibold text-sm">Frontend UI</span>
            </div>
            
            <ArrowRight className="text-gray-300 hidden md:block" />
            
            <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-md border border-blue-500 flex flex-col items-center w-full md:w-40 scale-110">
              <Sparkles className="mb-2" size={28} />
              <span className="font-bold text-sm">AI Engine</span>
            </div>

            <ArrowRight className="text-gray-300 hidden md:block" />
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center w-full md:w-32">
              <Database className="text-green-500 mb-2" size={28} />
              <span className="font-semibold text-sm">Local Data</span>
            </div>
            
            <ArrowRight className="text-gray-300 hidden md:block" />

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center w-full md:w-32">
              <Server className="text-purple-500 mb-2" size={28} />
              <span className="font-semibold text-sm">Reports</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Tech Stack Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <SectionHeading title="The Technology Stack" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stack.map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-start gap-4"
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
    </div>
  )
}
