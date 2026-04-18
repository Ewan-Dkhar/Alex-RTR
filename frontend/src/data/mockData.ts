export const mockChats = [
  { role: 'user', content: 'I want to open a coffee shop in Lucknow.' },
  { role: 'assistant', content: 'Great idea! Lucknow has a growing cafe culture. What is your estimated budget for the initial setup?' },
  { role: 'user', content: '15 lakh' },
  { role: 'assistant', content: 'With 15 lakh, you can opt for a solid mid-range to premium setup. Would you prefer a premium high-end feel or an affordable, high-volume positioning?' },
  { role: 'user', content: 'Affordable premium' },
  { role: 'assistant', content: 'Got it. Which area do you have in mind?\n\n- Gomti Nagar\n- Hazratganj\n- Indira Nagar' },
];

export const mockDashboardData = {
  area: 'Gomti Nagar',
  costRange: '₹12–18 lakh',
  topVendors: 'Beans & Dairy Supply Co.',
  expectedPricing: '₹140 avg order',
  breakEven: '8 months',
  demandScore: 'High'
};

export const mockCostData = [
  { name: 'Equipment', value: 4.5 },
  { name: 'Interiors', value: 5.5 },
  { name: 'Licenses & Legal', value: 1.0 },
  { name: 'Marketing', value: 1.5 },
  { name: 'Working Capital', value: 2.5 }
];

export const mockRevenueData = [
  { month: 'M1', revenue: 1.2 },
  { month: 'M2', revenue: 1.8 },
  { month: 'M3', revenue: 2.5 },
  { month: 'M4', revenue: 3.1 },
  { month: 'M5', revenue: 3.8 },
  { month: 'M6', revenue: 4.2 }
];

export const mockTestimonials = [
  {
    name: 'Raj S.',
    role: 'Cafe Owner',
    text: 'Alex-RTR gave me an exact roadmap. The vendor suggestions saved me 2 lakhs in setup cost alone!',
  },
  {
    name: 'Priya K.',
    role: 'Boutique Founder',
    text: 'This is better than any business consultant. I planned my launch in 10 minutes instead of 3 weeks.',
  },
  {
    name: 'Amit V.',
    role: 'Gym Entrepreneur',
    text: 'The local insights are unbelievable. It knew exactly the right equipment suppliers in my city.',
  }
];

export const mockFAQs = [
  {
    question: 'How accurate are estimates?',
    answer: 'Our AI aggregates recent market trends, local B2B vendor pricing, and real estate data to provide estimates with an 85-90% accuracy range.'
  },
  {
    question: 'Can I use this for any city?',
    answer: 'Currently we support major Indian metro and tier-1/tier-2 cities like Lucknow, Delhi NCR, Mumbai, Bangalore, Pune, and Hyderabad.'
  },
  {
    question: 'Can I export reports?',
    answer: 'Yes, your full launch roadmap and data models can be exported as a professional PDF for investors or bank loan applications.'
  },
  {
    question: 'Do I need business experience?',
    answer: 'Not at all! Alex-RTR is designed to guide first-time founders step-by-step through the process.'
  }
];

export const mockHeatmapData = [
  { id: 1, name: 'Plot A (Gomti N.)', cost: 12, roi: 8, type: 'commercial' },
  { id: 2, name: 'Plot B (Hazratganj)', cost: 25, roi: 15, type: 'retail' },
  { id: 3, name: 'Plot C (Indira N.)', cost: 18, roi: 12, type: 'commercial' },
  { id: 4, name: 'Plot D (Aliganj)', cost: 35, roi: 22, type: 'retail' },
  { id: 5, name: 'Plot E (Aminabad)', cost: 15, roi: 9, type: 'commercial' },
  { id: 6, name: 'Plot F (Chowk)', cost: 40, roi: 25, type: 'retail' },
  { id: 7, name: 'Plot G (Mahanagar)', cost: 20, roi: 14, type: 'commercial' },
  { id: 8, name: 'Plot H (Gomti N. Ext)', cost: 28, roi: 18, type: 'retail' },
  { id: 9, name: 'Plot I (Ashiyana)', cost: 10, roi: 6, type: 'commercial' },
  { id: 10, name: 'Plot J (Kapoorthala)', cost: 30, roi: 19, type: 'retail' },
  { id: 11, name: 'Plot K (Vikas N.)', cost: 22, roi: 13, type: 'commercial' },
  { id: 12, name: 'Plot L (Jankipuram)', cost: 14, roi: 8, type: 'commercial' }
];
