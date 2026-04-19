import { MessageCircle, Share2, Mail, Rocket, Layout, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { SectionHeading } from "../components/ui/SectionHeading"
import { Card } from "../components/ui/Card"

const team = [
  { name: "First Founder", role: "CEO & AI Expert", bio: "Passionate about empowering local businesses through artificial intelligence." },
  { name: "Second Founder", role: "SEO & Marketer", bio: "Focused on building scalable, performant and beautiful user interfaces." },
  { name: "Third Founder", role: "Head of Product", bio: "Ensuring every output creates distinct value for our future entrepreneurs." }
]

export function About() {
  return (
    <div className="bg-[#F8FAFF] pt-12 pb-24 min-h-screen font-sans">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 lg:max-w-lg">
            <h1 className="text-4xl md:text-[3.5rem] font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">Our Mission</h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              We built <span className="font-bold text-slate-900">Alex-RTR</span> to remove confusion from starting local businesses and make entrepreneurship accessible to everyone. We believe that with the right data and AI guidance, anyone can turn a local idea into a thriving storefront.
            </p>
          </div>
          <div className="flex-1 w-full relative hidden lg:block h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-[400px]">
                {/* 3D Storefront Card */}
                <div className="absolute bottom-0 left-[10%] right-[10%] h-[200px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.06)] p-6 z-10 flex flex-col justify-end">
                  <div className="flex gap-4">
                    <div className="w-1/3 h-24 bg-blue-50 rounded-xl" />
                    <div className="w-1/3 h-24 bg-blue-50 rounded-xl" />
                    <div className="w-1/3 h-24 bg-blue-50 rounded-xl" />
                  </div>
                </div>

                {/* Rocket launching */}
                <motion.div 
                  className="absolute bottom-[100px] left-[50%] -ml-12 z-20"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <div className="w-24 h-24 bg-blue-600 rounded-full shadow-[0_12px_40px_rgba(37,99,235,0.4)] flex items-center justify-center text-white">
                    <Rocket size={48} className="-translate-y-1 translate-x-1" />
                  </div>
                  <div className="w-8 h-12 bg-gradient-to-b from-orange-400 to-transparent mx-auto rounded-full blur-sm mt-2 opacity-50" />
                </motion.div>

                {/* Floating Widgets */}
                <motion.div 
                  className="absolute top-[20%] left-[5%] bg-white p-4 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] border border-[rgba(37,99,235,0.06)] z-30"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-500 rounded-xl"><Layout size={20} /></div>
                </motion.div>

                <motion.div 
                  className="absolute top-[10%] right-[15%] bg-white p-4 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] border border-[rgba(37,99,235,0.06)] z-30 flex items-center gap-3"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                >
                  <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><Sparkles size={20} /></div>
                  <div className="h-2 w-16 bg-slate-100 rounded-full" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Meet the Team</h2>
          <p className="text-slate-500">The builders behind Alex-RTR</p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          {team.map((member, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
              <Card variant="raised" className="h-[400px] text-center bg-white flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 border-0 shadow-[0_8px_30px_rgba(37,99,235,0.04)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.1)] py-12">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-[#F8FAFF] rounded-full border border-blue-50 flex items-center justify-center mb-8 text-blue-500 font-bold text-4xl shadow-inner">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{member.name}</h3>
                <p className="text-slate-500 font-medium text-sm mb-6">{member.role}</p>
                <div className="mt-auto w-3/4 h-2 bg-slate-50 rounded-full" />
                <div className="w-1/2 h-2 bg-slate-50 rounded-full mt-2" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
