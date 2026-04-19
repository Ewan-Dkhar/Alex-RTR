import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MapPin, Building2, BadgeIndianRupee, TrendingUp, Download, Map, X, ExternalLink, ShoppingCart, GraduationCap, Building, Activity, Bookmark, Star } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ComposedChart, Line } from 'recharts'
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { mockChats, mockAvailableLands } from "../data/mockData"
import { mockBusinessData } from "../data/lucknowBusinessROI"
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#1D4ED8'];

const DOMAINS = [
  "Food & Beverage",
  "Retail",
  "Salon & Beauty",
  "Gym & Fitness",
  "Pharmacy",
  "Clinic & Diagnostics",
  "Coaching & Education",
  "Coworking & Office",
  "Logistics & Warehouse",
  "Tourism & Hospitality"
];

const domainKeyMap: Record<string, string> = {
  "Food & Beverage": "roi_food_beverage",
  "Retail": "roi_retail",
  "Salon & Beauty": "roi_salon_beauty",
  "Gym & Fitness": "roi_gym_fitness",
  "Pharmacy": "roi_pharmacy",
  "Clinic & Diagnostics": "roi_clinic_diagnostics",
  "Coaching & Education": "roi_coaching_education",
  "Coworking & Office": "roi_coworking_office",
  "Logistics & Warehouse": "roi_logistics_warehouse",
  "Tourism & Hospitality": "roi_tourism_hospitality"
};

export function Demo() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I'm your Alex-RTR assistant. What local business idea do you want to explore?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  
  // 1. State Management
  const [minBudget, setMinBudget] = useState<number>(20);
  const [maxBudget, setMaxBudget] = useState<number>(80);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("Food & Beverage");

  const [compareList, setCompareList] = useState<any[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // 2. Budget Input Logic
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val <= maxBudget) {
      setMinBudget(val);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= minBudget) {
      setMaxBudget(val);
    }
  };

  // 3. Dynamic Filtering
  const ASSUMED_AREA_SQFT = 1000;

  const processedData = useMemo(() => {
    return mockBusinessData.map((loc: any) => {
      // Calculate estimated cost in Lakhs
      const costLakhs = (loc.avg_price_per_sqft * ASSUMED_AREA_SQFT) / 100000;
      const roiKey = domainKeyMap[selectedDomain];
      return {
        ...loc,
        name: loc.region,
        cost: parseFloat(costLakhs.toFixed(2)),
        roi: loc[roiKey] as number,
        type: loc.best_domain
      };
    });
  }, [selectedDomain]);

  const filteredLocations = useMemo(() => {
    let filtered = processedData.filter((p: any) => p.cost >= minBudget && p.cost <= maxBudget);
    filtered.sort((a: any, b: any) => b.roi - a.roi);
    return filtered;
  }, [processedData, minBudget, maxBudget]);

  const topLocations = filteredLocations.slice(0, 5);

  // Use selected location, or if not in current filter, pick top.
  const currentRegion = selectedLocation || (filteredLocations.length > 0 ? filteredLocations[0] : null);

  // 4. Donut Chart (Budget Allocation) using maxBudget as base
  const budgetAllocation = useMemo(() => {
    const baseBudget = maxBudget;
    
    const equipmentValue = parseFloat((baseBudget * 0.08).toFixed(1));
    const marketingValue = parseFloat((baseBudget * 0.18).toFixed(1));
    const licensesValue = parseFloat((baseBudget * 0.05).toFixed(1));
    const acquisitionValue = parseFloat((baseBudget * 0.52).toFixed(1));
    const registryValue = parseFloat((baseBudget * 0.07).toFixed(1));
    const workingCapitalValue = parseFloat((baseBudget * 0.10).toFixed(1));

    return [
      { name: 'Equipment & Setup', value: equipmentValue },
      { name: 'Initial Marketing', value: marketingValue },
      { name: 'Licenses & Permits', value: licensesValue },
      { name: 'Property Acquisition', value: acquisitionValue },
      { name: 'Registry', value: registryValue },
      { name: 'Working Capital', value: workingCapitalValue }
    ];
  }, [maxBudget]);

  const totalCapEx = maxBudget;

  // 5. Business Growth Projection Chart
  const businessGrowthData = useMemo(() => {
    const baseRev = currentRegion ? currentRegion.cost * 0.2 : maxBudget * 0.2; 
    const projectionRoi = currentRegion ? currentRegion.roi : (filteredLocations.reduce((sum: number, l: any) => sum + l.roi, 0) / (filteredLocations.length || 1));

    let cumulativeProfit = 0;
    const projection = [];
    
    for (let m = 1; m <= 6; m++) {
      // monthRevenue = base * (1 + ROI/100)^month
      const monthlyRevLakhs = baseRev * Math.pow(1 + (projectionRoi / 100), m);
      const monthlyProfitLakhs = monthlyRevLakhs * 0.45; // 45% profit margin
      
      cumulativeProfit += monthlyProfitLakhs;
      
      projection.push({
        month: `M${m}`,
        revenue: parseFloat(monthlyRevLakhs.toFixed(2)),
        profit: parseFloat(monthlyProfitLakhs.toFixed(2))
      });
    }

    const investment = currentRegion ? currentRegion.cost : maxBudget;
    const total6MonthROI = investment > 0 ? ((cumulativeProfit / investment) * 100).toFixed(1) : 0;

    return { projection, total6MonthROI };

  }, [currentRegion, maxBudget, filteredLocations]);

  // 7. Saved Feature
  const toggleSave = (id: number) => {
    setSavedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(savedId => savedId !== id);
      }
      return [...prev, id];
    });
  };

  const toggleCompare = (plot: any) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === plot.id);
      if (exists) return prev.filter(p => p.id !== plot.id);
      if (prev.length >= 4) return prev; 
      return [...prev, plot];
    });
  };

  const handleSend = () => {
    if(!input.trim()) return;
    
    const newMsg = { role: "user", content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (step < mockChats.length) {
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
    <div className="min-h-screen bg-[#F8FAFF] pt-8 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Venture Dashboard</h1>
            <p className="text-gray-500 mt-1">Smart Business Decision Tool</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Business Domain:</label>
              <select 
                value={selectedDomain} 
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
              >
                {DOMAINS.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" className="hidden sm:flex gap-2 bg-white print:hidden" onClick={() => window.print()}>
              <Download size={16} />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Top Locations + Chat) */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-[800px]">
            <Card variant="raised" className="flex flex-col p-0 overflow-hidden bg-white max-h-[350px]">
              <div className="p-4 border-b border-[rgba(37,99,235,0.06)] bg-[#F8FAFF] shrink-0 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Star className="text-amber-500 fill-amber-500" size={18} /> Top 5 Recommendations
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Best areas for {selectedDomain}</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {topLocations.map((loc: any, i: number) => (
                    <motion.div 
                      key={loc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div 
                        onClick={() => setSelectedLocation(loc)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedLocation?.id === loc.id 
                            ? 'border-blue-500 bg-blue-50/30 shadow-[0_4px_12px_rgba(37,99,235,0.1)]' 
                            : 'border-[rgba(37,99,235,0.06)] hover:border-blue-200 hover:bg-[#F8FAFF]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                              {i + 1}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm tracking-tight">{loc.name}</h4>
                          </div>
                          <span className={`text-xs font-extrabold ${loc.roi >= 22 ? 'text-orange-600' : loc.roi >= 15 ? 'text-yellow-600' : 'text-blue-600'}`}>
                            {loc.roi}% ROI
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between items-center">
                          <span>Est. Cost: <strong className="text-gray-800">₹{loc.cost}L</strong></span>
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">Best: {loc.best_domain}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {topLocations.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      No locations match your budget.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </Card>

            <Card variant="raised" className="flex-1 min-h-[400px] flex flex-col p-0 overflow-hidden bg-white print:hidden">
              <div className="p-4 border-b border-[rgba(37,99,235,0.06)] bg-[#F8FAFF] shrink-0">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px]">AI</div>
                  AI Consultant
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

              <div className="p-4 border-t border-gray-100 bg-white shrink-0">
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
          </div>

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
                <Card variant="raised" className="p-5 flex flex-col justify-center transition-transform h-full">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="p-1 bg-blue-50 rounded-md text-blue-600"><MapPin size={14} /></div>
                    Selected Area
                  </div>
                  <div className="text-2xl font-black text-slate-900">{currentRegion?.name || 'Avg of Filtered'}</div>
                  <div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md self-start mt-3">{selectedDomain}</div>
                </Card>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Card variant="raised" className="p-5 flex flex-col justify-center transition-transform h-full">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="p-1 bg-green-50 rounded-md text-green-600"><BadgeIndianRupee size={14} /></div>
                    Target Budget
                  </div>
                  <div className="text-2xl font-black text-slate-900">₹{totalCapEx}L</div>
                  <div className="text-[11px] font-medium text-slate-400 self-start mt-3">Max Budget Set</div>
                </Card>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="sm:col-span-1 col-span-2">
                <Card variant="raised" className="p-5 flex flex-col justify-center transition-transform h-full">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="p-1 bg-orange-50 rounded-md text-orange-600"><TrendingUp size={14} /></div>
                    Projected ROI
                  </div>
                  <div className="text-2xl font-black text-slate-900">{(currentRegion ? currentRegion.roi : (filteredLocations.reduce((sum: number, l: any) => sum + l.roi, 0) / (filteredLocations.length || 1))).toFixed(1)}% <span className="text-sm font-medium text-slate-400">for {selectedDomain}</span></div>
                  <div className="text-[11px] text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-md self-start mt-3">{currentRegion && currentRegion.roi >= 22 ? 'Excellent' : 'Good'} Potential</div>
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
                        data={budgetAllocation}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {budgetAllocation.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`₹${value}L`, 'Allocation']} />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card variant="raised" className="p-5 flex flex-col h-full relative">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><TrendingUp size={16}/> Business Growth Projection (6 Months)</h3>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">6-Mo ROI</div>
                    <div className="text-sm font-bold text-blue-600">{businessGrowthData.total6MonthROI}%</div>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={businessGrowthData.projection} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" hide />
                      <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value: any, name: any) => [`₹${value}L`, name === 'revenue' ? 'Revenue' : 'Profit']} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} name="Growth Trend" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Heatmap Section */}
            <Card variant="raised" className="p-5 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Map size={16}/> ROI Heatmap ({selectedDomain})</h3>
                </div>
                <div className="flex items-center gap-3 print:hidden">
                  <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-500 font-medium">Min (₹L):</label>
                    <input type="number" value={minBudget} onChange={handleMinChange} className="w-16 px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-500 font-medium">Max (₹L):</label>
                    <input type="number" value={maxBudget} onChange={handleMaxChange} className="w-16 px-2 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              
              <div className="relative h-[500px] w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner z-0">
                <MapContainer center={[26.8467, 80.9462]} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">Carto</a>'
                  />
                  {filteredLocations.map((plot: any) => {
                        const isSelected = selectedLocation?.id === plot.id;
                        const isHigh = plot.roi >= 22;
                        const isMedium = plot.roi >= 15 && plot.roi < 22;
                        
                        let markerColor = '#3B82F6'; // blue
                        let fillColor = '#60A5FA';
                        if (isHigh) {
                          markerColor = '#DC2626'; // red/orange
                          fillColor = '#F87171';
                        } else if (isMedium) {
                          markerColor = '#D97706'; // yellow/orange
                          fillColor = '#FBBF24';
                        }
                        
                        return (
                          <CircleMarker 
                            key={plot.id} 
                            center={[plot.lat, plot.lng]} 
                            radius={isHigh ? 16 : 14}
                            eventHandlers={{ click: () => setSelectedLocation(plot) }}
                            pathOptions={{ 
                              color: isSelected ? '#1E3A8A' : markerColor,
                              fillColor: fillColor,
                              fillOpacity: isHigh ? 0.9 : 0.7,
                              weight: isSelected ? 4 : (isHigh ? 3 : 2)
                            }}
                          >
                            <Popup className="custom-popup">
                              <div className="p-1 min-w-[220px]">
                                <div className="flex justify-between items-start mb-2 border-b pb-2">
                                  <div className="flex flex-col">
                                    <h4 className="font-bold text-gray-900 text-sm">{plot.name}</h4>
                                    <span className="text-[10px] text-gray-500">{selectedDomain}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isHigh ? 'bg-orange-50 text-orange-700' : isMedium ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {plot.roi}% ROI
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 mb-1.5">Investment: <strong className="text-gray-900">₹{plot.cost}L</strong></p>
                                <p className="text-[11px] text-gray-500 mb-3">Best Domain Suggestion: <strong className="text-gray-900">{plot.best_domain}</strong></p>
                                
                                <Button 
                                  variant="primary"
                                  className="w-full text-xs py-1.5 h-auto"
                                  onClick={() => setSelectedLocation(plot)}
                                >
                                  Update Projection
                                </Button>
                              </div>
                            </Popup>
                          </CircleMarker>
                        );
                      })}
                    </MapContainer>
              </div>
              
              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center text-xs text-gray-500 gap-3">
                <span className="font-medium">Showing locations between ₹{minBudget}L and ₹{maxBudget}L</span>
                <div className="flex gap-4 items-center bg-gray-50 px-3 py-1.5 rounded-full">
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div> &lt; 15% ROI</span>
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div> 15-22% ROI</span>
                  <span className="flex items-center gap-1.5 font-medium"><div className="w-2.5 h-2.5 bg-red-400 rounded-full shadow-[0_0_6px_rgba(220,38,38,0.4)]"></div> &gt; 22% ROI</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
