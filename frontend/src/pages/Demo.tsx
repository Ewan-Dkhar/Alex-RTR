import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MapPin, Building2, BadgeIndianRupee, TrendingUp, Download } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { mockChats, mockDashboardData, mockCostData, mockRevenueData } from "../data/mockData"

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

export function Demo() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I'm your Alex-RTR assistant. What local business idea do you want to explore?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);

  const handleSend = () => {
    if(!input.trim()) return;
    
    const newMsg = { role: "user", content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (step < mockChats.length) {
        // Skip user roles from mock to get next assistant response
        const nextMockIndex = mockChats.findIndex((m, i) => i > step && m.role === 'assistant');
        if (nextMockIndex !== -1) {
          setMessages(prev => [...prev, mockChats[nextMockIndex]]);
          setStep(nextMockIndex);
        } else {
          setMessages(prev => [...prev, { role: "assistant", content: "Great! Generating your full launch roadmap now." }]);
        }
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-skeuo-white pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Venture Dashboard</h1>
            <p className="text-gray-500 mt-1">Interactive planning session</p>
          </div>
          <Button variant="outline" className="hidden sm:flex gap-2 bg-white">
            <Download size={16} />
            Export PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Panel */}
          <Card variant="raised" className="lg:col-span-1 h-[600px] flex flex-col p-0 overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" /> AI Consultant
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" size="sm" className="rounded-xl px-4 py-2.5 h-auto">
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </Card>

          {/* Insights Panel */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Card variant="raised" className="p-5 flex flex-col justify-center hover:scale-[1.02] transition-transform h-full">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={14}/> Top Area</div>
                  <div className="text-xl font-bold text-gray-900">{mockDashboardData.area}</div>
                </Card>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Card variant="raised" className="p-5 flex flex-col justify-center hover:scale-[1.02] transition-transform h-full">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><BadgeIndianRupee size={14}/> Setup Est.</div>
                  <div className="text-xl font-bold text-gray-900">{mockDashboardData.costRange}</div>
                </Card>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="sm:col-span-1 col-span-2">
                <Card variant="raised" className="p-5 flex flex-col justify-center hover:scale-[1.02] transition-transform h-full">
                  <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={14}/> Break Even</div>
                  <div className="text-lg font-bold text-gray-900">{mockDashboardData.breakEven}</div>
                </Card>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
              <Card variant="raised" className="p-5 flex flex-col h-full">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Building2 size={16}/> Budget Allocation</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockCostData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockCostData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`₹${value}L`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card variant="raised" className="p-5 flex flex-col h-full">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={16}/> Revenue Projection (6 Mo)</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value: any) => [`₹${value}L`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
