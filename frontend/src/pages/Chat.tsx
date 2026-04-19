import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MapPin, Building2, BadgeIndianRupee, TrendingUp, Download, Map, X, ExternalLink, ShoppingCart, GraduationCap, Building, Activity, Bookmark, Star, ArrowRightLeft, Trash2 } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ComposedChart, Line, CartesianGrid } from 'recharts'
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { mockBusinessData } from "../data/lucknowBusinessROI"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// --- Constants & Helpers ---

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

const DOMAIN_AREA_MAP: Record<string, number> = {
  "Food & Beverage": 1200,
  "Retail": 900,
  "Salon & Beauty": 700,
  "Gym & Fitness": 2000,
  "Pharmacy": 500,
  "Clinic & Diagnostics": 1000,
  "Coaching & Education": 1800,
  "Coworking & Office": 2500,
  "Logistics & Warehouse": 5000,
  "Tourism & Hospitality": 3000
};

const BUDGET_MODELS: Record<string, any> = {
  "Food & Beverage": { equipment_setup: 0.22, initial_marketing: 0.12, licenses_permits: 0.06, property_acquisition: 0.30, registry_stamp_duty: 0.05, working_capital: 0.25 },
  "Retail": { equipment_setup: 0.12, initial_marketing: 0.10, licenses_permits: 0.05, property_acquisition: 0.45, registry_stamp_duty: 0.08, working_capital: 0.20 },
  "Salon & Beauty": { equipment_setup: 0.20, initial_marketing: 0.10, licenses_permits: 0.05, property_acquisition: 0.35, registry_stamp_duty: 0.05, working_capital: 0.25 },
  "Gym & Fitness": { equipment_setup: 0.30, initial_marketing: 0.08, licenses_permits: 0.04, property_acquisition: 0.28, registry_stamp_duty: 0.05, working_capital: 0.25 },
  "Pharmacy": { equipment_setup: 0.14, initial_marketing: 0.06, licenses_permits: 0.10, property_acquisition: 0.34, registry_stamp_duty: 0.06, working_capital: 0.30 },
  "Clinic & Diagnostics": { equipment_setup: 0.24, initial_marketing: 0.08, licenses_permits: 0.10, property_acquisition: 0.28, registry_stamp_duty: 0.05, working_capital: 0.25 },
  "Coaching & Education": { equipment_setup: 0.10, initial_marketing: 0.12, licenses_permits: 0.04, property_acquisition: 0.42, registry_stamp_duty: 0.07, working_capital: 0.25 },
  "Coworking & Office": { equipment_setup: 0.16, initial_marketing: 0.08, licenses_permits: 0.04, property_acquisition: 0.47, registry_stamp_duty: 0.08, working_capital: 0.17 },
  "Logistics & Warehouse": { equipment_setup: 0.18, initial_marketing: 0.05, licenses_permits: 0.04, property_acquisition: 0.50, registry_stamp_duty: 0.08, working_capital: 0.15 },
  "Tourism & Hospitality": { equipment_setup: 0.22, initial_marketing: 0.14, licenses_permits: 0.06, property_acquisition: 0.32, registry_stamp_duty: 0.05, working_capital: 0.21 }
};

const parseBudget = (reply: string, data: any) => {
  let min = data?.budgetMin || data?.minBudget;
  let max = data?.budgetMax || data?.maxBudget || data?.budget;
  if (data?.budgetRange) {
    const range = data.budgetRange.toString().match(/(\d+).+?(\d+)/);
    if (range) { min = parseInt(range[1]); max = parseInt(range[2]); }
  }
  if (min === undefined && max === undefined) {
    const t = reply.toLowerCase();
    const rangeMatch = t.match(/(\d+)\s*(?:l|lakh)?\s*(?:to|and|-)\s*(\d+)\s*(?:l|lakh)?/i);
    if (rangeMatch) { min = parseInt(rangeMatch[1]); max = parseInt(rangeMatch[2]); }
    else {
      const singleMatch = t.match(/(?:under|below|upto|within|at|budget of|max|maximum)?\s*(\d+)\s*(?:l|lakh)?/i);
      if (singleMatch) { max = parseInt(singleMatch[1]); min = 0; }
    }
  }
  return {
    min: min !== undefined && min !== null && !isNaN(parseInt(min)) ? Number(min) : null,
    max: max !== undefined && max !== null && !isNaN(parseInt(max)) ? Number(max) : null
  };
};

function MapRefocus({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

export function Chat() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi! I'm your Alex-RTR assistant. What local business idea do you want to explore?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [dynamicROI, setDynamicROI] = useState<number | null>(null);
  const [dynamicGrowth, setDynamicGrowth] = useState<number | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(res => res.json())
      .then(data => { if(data.status === "ok") setConnectionStatus("connected"); else setConnectionStatus("disconnected"); })
      .catch(() => setConnectionStatus("disconnected"));
  }, []);
  
  const [minBudget, setMinBudget] = useState<number>(20);
  const [maxBudget, setMaxBudget] = useState<number>(80);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>("Food & Beverage");
  const [mapCenter, setMapCenter] = useState<[number, number]>([26.8467, 80.9462]);
  const [mapZoom, setMapZoom] = useState<number>(11);

  // Required Fix 1: Add Global State for Comparison
  const [compareList, setCompareList] = useState<any[]>([]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => setMinBudget(Number(e.target.value));
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => setMaxBudget(Number(e.target.value));

  const processedData = useMemo(() => {
    const assumedArea = DOMAIN_AREA_MAP[selectedDomain] || 1000;
    return mockBusinessData.map((loc: any) => {
      const costLakhs = (loc.avg_price_per_sqft * assumedArea) / 100000;
      return {
        ...loc,
        name: loc.region,
        cost: parseFloat(costLakhs.toFixed(2)),
        roi: loc[domainKeyMap[selectedDomain]] as number,
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
  const currentRegion = selectedLocation || (filteredLocations.length > 0 ? filteredLocations[0] : null);

  // Required Fix 2: Toggle Comparison logic
  const toggleCompare = (location: any) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === location.id);
      if (exists) return prev.filter(p => p.id !== location.id);
      if (prev.length >= 4) return prev;
      return [...prev, location];
    });
  };

  const budgetAllocation = useMemo(() => {
    const totalBudget = currentRegion ? currentRegion.cost : maxBudget;
    const model = BUDGET_MODELS[selectedDomain] || BUDGET_MODELS["Retail"];
    const mapping = [
      { key: 'equipment_setup', name: 'Equipment & Setup' },
      { key: 'initial_marketing', name: 'Initial Marketing' },
      { key: 'licenses_permits', name: 'Licenses & Permits' },
      { key: 'property_acquisition', name: 'Property Acquisition' },
      { key: 'registry_stamp_duty', name: 'Registry & Stamp Duty' },
      { key: 'working_capital', name: 'Working Capital' }
    ];
    return mapping.map(item => ({
      name: item.name,
      value: parseFloat((totalBudget * (model[item.key] || 0)).toFixed(2)),
      percent: Math.round((model[item.key] || 0) * 100)
    }));
  }, [selectedDomain, currentRegion, maxBudget]);

  const totalCapEx = currentRegion ? currentRegion.cost : maxBudget;

  const businessGrowthData = useMemo(() => {
    const projectionRoi = dynamicROI ?? (currentRegion ? currentRegion.roi : 15);
    const growthRate = dynamicGrowth ?? 0.05;
    const investment = currentRegion ? currentRegion.cost : maxBudget;
    const baseRev = investment * (projectionRoi / 100) / 12;
    let cumulativeProfit = 0;
    const projection = [];
    for (let m = 1; m <= 6; m++) {
      const monthlyRevLakhs = baseRev * Math.pow(1 + growthRate, m);
      const monthlyProfitLakhs = monthlyRevLakhs * 0.45;
      cumulativeProfit += monthlyProfitLakhs;
      projection.push({ month: `M${m}`, revenue: parseFloat(monthlyRevLakhs.toFixed(2)), profit: parseFloat(monthlyProfitLakhs.toFixed(2)) });
    }
    return { projection, total6MonthROI: investment > 0 ? ((cumulativeProfit / investment) * 100).toFixed(1) : 0 };
  }, [currentRegion, maxBudget, dynamicROI, dynamicGrowth]);

  const handleSend = async () => {
    if(!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    const promptText = input;
    setInput("");
    setIsTyping(true);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: promptText }) });
      if (!response.ok) throw new Error("Backend offline");
      const resData = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: resData.reply }]);
      if (resData.data) {
        const d = resData.data;
        if (d.domain) { const match = DOMAINS.find(dom => dom.toLowerCase() === d.domain.toLowerCase()); if (match) setSelectedDomain(match); }
        const budgetUpdate = parseBudget(resData.reply, d);
        if (budgetUpdate.max !== null) { setMinBudget(Math.max(0, Math.min(budgetUpdate.min || 0, budgetUpdate.max))); setMaxBudget(budgetUpdate.max); }
        if (d.roi) setDynamicROI(Number(d.roi));
        if (d.growthRate) setDynamicGrowth(Number(d.growthRate));
        if (d.region) {
          const locMatch = mockBusinessData.find((p: any) => p.region.toLowerCase().includes(d.region.toLowerCase()) || d.region.toLowerCase().includes(p.region.toLowerCase()));
          if (locMatch) {
            const area = DOMAIN_AREA_MAP[d.domain || selectedDomain] || 1000;
            setSelectedLocation({ ...locMatch, name: locMatch.region, cost: parseFloat(((locMatch.avg_price_per_sqft * area) / 100000).toFixed(2)), roi: locMatch[domainKeyMap[d.domain || selectedDomain]] || locMatch.roi_food_beverage });
            setMapCenter([locMatch.lat, locMatch.lng]);
            setMapZoom(13);
          }
        }
      }
    } catch (error) { setMessages(prev => [...prev, { role: "assistant", content: "Backend unreachable." }]); } finally { setIsTyping(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] pt-8 pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-gray-900 tracking-tight">Venture Dashboard</h1><p className="text-gray-500 mt-1">Smart Business Decision Tool</p></div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><label className="text-sm font-semibold text-gray-700">Business Domain:</label>
              <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm">{DOMAINS.map(domain => <option key={domain} value={domain}>{domain}</option>)}</select>
            </div>
            {/* Required Fix 11: Compare Badge */}
            <Button variant="outline" className={`hidden sm:flex gap-2 bg-white ${compareList.length > 0 ? 'border-blue-500 text-blue-600' : ''}`} onClick={() => { if(compareList.length >= 2) document.getElementById('comparison-panel')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <ArrowRightLeft size={16} /> Compare ({compareList.length})
            </Button>
            <Button variant="outline" className="hidden sm:flex gap-2 bg-white print:hidden" onClick={() => window.print()}><Download size={16} /> Export PDF</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-6 h-[800px]">
            <Card variant="raised" className="flex flex-col p-0 overflow-hidden bg-white max-h-[350px]">
              <div className="p-4 border-b border-gray-100 bg-[#F8FAFF] shrink-0"><div className="font-bold text-slate-900 flex items-center gap-2"><Star className="text-amber-500 fill-amber-500" size={18} /> Top 5 Recommendations</div><p className="text-xs text-slate-500 mt-1">Best areas for {selectedDomain}</p></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {topLocations.map((loc: any, i: number) => (
                    <motion.div key={loc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <div onClick={() => { setSelectedLocation(loc); setMapCenter([loc.lat, loc.lng]); setMapZoom(13); }} className={`p-3 rounded-2xl border transition-all cursor-pointer ${currentRegion?.id === loc.id ? 'border-blue-500 bg-blue-50/30 shadow-md' : 'border-gray-100 hover:border-blue-200 hover:bg-[#F8FAFF]'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2.5"><div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{i + 1}</div><h4 className="font-bold text-slate-900 text-sm tracking-tight">{loc.name}</h4></div>
                          <span className={`text-xs font-extrabold ${loc.roi >= 22 ? 'text-orange-600' : 'text-blue-600'}`}>{loc.roi}% ROI</span>
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between items-center"><span>Est. Cost: <strong className="text-gray-800">₹{loc.cost}L</strong></span><span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">Area: {DOMAIN_AREA_MAP[selectedDomain]} sqft</span></div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>

            <Card variant="raised" className="flex-1 min-h-[400px] flex flex-col p-0 overflow-hidden bg-white print:hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 shrink-0 flex justify-between items-center"><div className="font-semibold text-gray-900 flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} /><div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px]">AI</div> AI Consultant</div></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>{messages.map((msg, i) => (<motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div></motion.div>))}</AnimatePresence>
                {isTyping && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-2xl flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" /><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" /></div></div>}
              </div>
              <div className="p-4 border-t border-gray-100 bg-white shrink-0"><form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about budgets or regions..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /><Button type="submit" size="sm" className="rounded-xl px-4 py-2.5 h-auto"><Send size={16} /></Button></form></div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card variant="raised" className="p-5 flex flex-col justify-center"><div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><div className="p-1 bg-blue-50 rounded-md text-blue-600"><MapPin size={14} /></div> Selected Area</div><div className="text-2xl font-black text-slate-900 truncate">{currentRegion?.name || 'Search Region'}</div><div className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md self-start mt-3">{selectedDomain}</div></Card>
              <Card variant="raised" className="p-5 flex flex-col justify-center"><div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><div className="p-1 bg-green-50 rounded-md text-green-600"><BadgeIndianRupee size={14} /></div> Target Budget</div><div className="text-2xl font-black text-slate-900">₹{totalCapEx}L</div><div className="text-[11px] font-medium text-slate-400 self-start mt-3">Range: {minBudget}L - {maxBudget}L</div></Card>
              <Card variant="raised" className="p-5 flex flex-col justify-center sm:col-span-1 col-span-2 border border-orange-50 relative overflow-hidden"><div className="absolute top-0 right-0 p-2"><TrendingUp size={24} className="text-orange-100/30" /></div><div className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1 z-10"><TrendingUp size={14} className="text-orange-500"/> Projected ROI</div><div className="text-2xl font-black text-slate-900 z-10">{currentRegion?.roi}% <span className="text-sm font-medium text-slate-400 ml-2">Potential</span></div><div className="text-[11px] text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-md self-start mt-3 z-10">{currentRegion?.roi >= 22 ? 'Excellent' : 'Stable'} Opportunity</div></Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
              <Card variant="raised" className="p-5 flex flex-col h-full"><h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Building2 size={16}/> Budget Allocation</h3><div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={budgetAllocation} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">{budgetAllocation.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(value: any, name: any, props: any) => [`₹${value}L (${props.payload.percent}%)`, `${name} (of ₹${currentRegion?.cost || maxBudget}L)`]} /><Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px' }} formatter={(value, entry: any) => (<span className="text-gray-700">{value} <span className="text-blue-600 font-bold">{entry.payload.percent}%</span> — ₹{entry.payload.value}L</span>)} /></PieChart></ResponsiveContainer></div></Card>
              <Card variant="raised" className="p-5 flex flex-col h-full relative"><div className="flex justify-between items-start mb-4"><h3 className="font-semibold text-gray-800 flex items-center gap-2"><TrendingUp size={16}/> 6-Month Projection</h3><div className="text-right"><div className="text-[10px] text-gray-500 font-semibold">EST. ROI</div><div className="text-sm font-bold text-blue-600">{businessGrowthData.total6MonthROI}%</div></div></div><div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={businessGrowthData.projection} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}><XAxis dataKey="month" tick={{fontSize: 10}} axisLine={false} tickLine={false} /><YAxis yAxisId="left" tick={{fontSize: 10}} axisLine={false} tickLine={false} /><YAxis yAxisId="right" orientation="right" hide /><Tooltip formatter={(value: any, name: any) => [`₹${value}L`, name === 'revenue' ? 'Revenue' : 'Profit']} /><Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" /><Line yAxisId="right" type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={3} name="Profit" /></ComposedChart></ResponsiveContainer></div></Card>
            </div>

            <Card variant="raised" className="p-5 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3"><h3 className="font-semibold text-gray-800 flex items-center gap-2"><Map size={16}/> ROI Heatmap</h3><div className="flex items-center gap-3 print:hidden"><div className="flex items-center gap-2 text-sm"><label className="text-gray-500 font-medium">Min:</label><input type="number" value={minBudget} onChange={handleMinChange} className="w-20 px-2 py-1.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" /></div><div className="flex items-center gap-2 text-sm"><label className="text-gray-500 font-medium">Max:</label><input type="number" value={maxBudget} onChange={handleMaxChange} className="w-20 px-2 py-1.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" /></div></div></div>
              <div className="relative h-[500px] w-full rounded-xl overflow-hidden border border-gray-100 z-0">
                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">Carto</a>' />
                  <MapRefocus center={mapCenter} zoom={mapZoom} />
                  {filteredLocations.map((plot: any) => {
                    const isSelected = currentRegion?.id === plot.id;
                    // Required Fix 3: Visual Feedback for Comparison
                    const isComparing = compareList.some(p => p.id === plot.id);
                    const isHigh = plot.roi >= 22;
                    const isMedium = plot.roi >= 15 && plot.roi < 22;
                    let markerColor = '#3B82F6'; let fillColor = '#60A5FA';
                    if (isHigh) { markerColor = '#DC2626'; fillColor = '#F87171'; } else if (isMedium) { markerColor = '#D97706'; fillColor = '#FBBF24'; }
                    return (
                      <CircleMarker key={plot.id} center={[plot.lat, plot.lng]} radius={isSelected ? 18 : (isComparing ? 16 : (isHigh ? 14 : 12))} eventHandlers={{ click: () => { setSelectedLocation(plot); setMapCenter([plot.lat, plot.lng]); }}} pathOptions={{ color: isComparing ? '#8B5CF6' : (isSelected ? '#1E3A8A' : markerColor), fillColor: isComparing ? '#A78BFA' : fillColor, fillOpacity: isHigh ? 0.9 : 0.7, weight: (isSelected || isComparing) ? 4 : 2, dashArray: isComparing ? "5, 5" : undefined }}>
                        <Popup><div className="p-1 min-w-[200px]"><h4 className="font-bold text-gray-900">{plot.name}</h4><p className="text-xs text-gray-500 mb-2">{selectedDomain}</p><div className="flex justify-between text-xs mb-1"><span>ROI:</span> <span className="font-bold text-blue-600">{plot.roi}%</span></div><div className="flex justify-between text-xs mb-3"><span>Cost:</span> <span className="font-bold">₹{plot.cost}L</span></div>
                        {/* Required Fix 2 & 9: Updated Popup Button */}
                        <Button 
                          variant={isComparing ? "outline" : "primary"} 
                          size="sm" 
                          className={`w-full h-9 text-[11px] font-bold ${isComparing ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}`} 
                          onClick={() => toggleCompare(plot)}
                        >
                          {isComparing ? "Remove from Compare" : "Add to Compare"}
                        </Button>
                        </div></Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center text-[10px] text-gray-400 gap-3">
                <span className="font-medium uppercase tracking-wider">Heatmap Active: ₹{minBudget}L - ₹{maxBudget}L</span>
                <div className="flex gap-4 items-center bg-gray-50 px-3 py-1.5 rounded-full text-gray-500 font-bold"><span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-400 rounded-full"></div> LOW</span><span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-yellow-400 rounded-full"></div> MID</span><span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-400 rounded-full"></div> HIGH ROI</span></div>
              </div>
            </Card>

            {/* Required Fix 4, 5, 6, 7: Comparison Panel */}
            {compareList.length >= 2 && (
              <motion.div id="comparison-panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <Card variant="raised" className="p-6 border-t-4 border-blue-600 bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <div><h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><ArrowRightLeft className="text-blue-600" size={24} /> Location Comparison</h3><p className="text-sm text-slate-500 mt-1">Comparing {compareList.length} selected areas in {selectedDomain}</p></div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 gap-2" onClick={() => setCompareList([])}><Trash2 size={16}/> Clear Selections</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Required Fix 5: Comparison Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="py-4 px-4 font-bold text-slate-700">Region</th>
                            <th className="py-4 px-4 font-bold text-slate-700">ROI %</th>
                            <th className="py-4 px-4 font-bold text-slate-700">Cost (₹L)</th>
                            <th className="py-4 px-4 font-bold text-slate-700">Demand</th>
                            <th className="py-4 px-4 font-bold text-slate-700">Infra</th>
                            <th className="py-4 px-4 text-center"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {compareList.map(item => (
                            <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                              <td className="py-4 px-4 font-bold text-slate-900">{item.name}</td>
                              <td className="py-4 px-4 text-blue-600 font-black">{item.roi}%</td>
                              <td className="py-4 px-4 font-medium">₹{item.cost}L</td>
                              <td className="py-4 px-4"><span className={`px-2 py-1 rounded-md text-[10px] font-bold ${item.demand_level?.includes('High') ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{item.demand_level || 'N/A'}</span></td>
                              <td className="py-4 px-4 font-medium">{item.infrastructure_score}/10</td>
                              <td className="py-4 px-4 text-center"><button onClick={() => toggleCompare(item)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18}/></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Required Fix 6: Chart Comparison */}
                    <div className="h-[300px] p-4 bg-gray-50/30 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ROI Comparison (%)</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={compareList} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} angle={-15} textAnchor="end" />
                          <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                          <Bar dataKey="roi" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} name="ROI Potential" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
