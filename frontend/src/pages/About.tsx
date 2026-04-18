import { MessageCircle, Share2, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { SectionHeading } from "../components/ui/SectionHeading"
import { Card } from "../components/ui/Card"

const team = [
  { name: "First Founder", role: "CEO & AI Engineer", bio: "Passionate about empowering local businesses through artificial intelligence." },
  { name: "Second Founder", role: "CTO & Architect", bio: "Focused on building scalable, performant and beautiful user interfaces." },
  { name: "Third Founder", role: "Head of Product", bio: "Ensuring every output creates distinct value for our future entrepreneurs." }
]

export function About() {
  return (
    <div className="bg-skeuo-white pt-12 pb-24 min-h-screen">
      <section className="max-w-3xl mx-auto px-4 text-center mb-24 mt-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Mission</h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          We built <span className="font-semibold text-gray-900">Alex-RTR</span> to remove confusion from starting local businesses and make entrepreneurship accessible to everyone. We believe that with the right data and AI guidance, anyone can turn a local idea into a thriving storefront.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <SectionHeading title="Meet the Team" subtitle="The builders behind Alex-RTR" />
        
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
              <Card variant="raised" className="h-full text-center bg-white flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 hover:shadow-[var(--shadow-skeuo-hover)]">
              <div className="w-24 h-24 bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center mb-4 text-blue-300 font-bold text-2xl">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-medium text-sm mb-4">{member.role}</p>
              <p className="text-gray-500 mb-6 text-sm">{member.bio}</p>
              <div className="flex gap-4 text-gray-400 mt-auto">
                <a href="#" className="hover:text-blue-500 transition-colors"><Mail size={20}/></a>
                <a href="#" className="hover:text-blue-500 transition-colors"><MessageCircle size={20}/></a>
                <a href="#" className="hover:text-blue-500 transition-colors"><Share2 size={20}/></a>
              </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-blue-600 text-white py-16 text-center transform -skew-y-1 my-12">
        <div className="transform skew-y-1 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Empower anyone to launch businesses smarter.</h2>
          <p className="text-blue-100">Built during Hackathon 2026.</p>
        </div>
      </section>
    </div>
  )
}
