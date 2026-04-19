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

import heatmapDataFromJson from './mockHeatmapData.json';
export const mockHeatmapData = heatmapDataFromJson;

export const mockAvailableLands = [
  { id: 101, regionId: 1, title: 'Corner Plot near Market', size: '1500 sqft', price: '₹45L', type: 'Commercial', status: 'Available' },
  { id: 102, regionId: 1, title: 'Main Road Frontage', size: '2000 sqft', price: '₹60L', type: 'Commercial', status: 'Under Negotiation' },
  { id: 103, regionId: 2, title: 'Residential Land', size: '1200 sqft', price: '₹35L', type: 'Residential', status: 'Available' },
  { id: 104, regionId: 3, title: 'Highway Touch Plot', size: '5000 sqft', price: '₹1.5Cr', type: 'Industrial', status: 'Available' },
  { id: 105, regionId: 4, title: 'Warehouse Space', size: '10000 sqft', price: '₹2.5Cr', type: 'Industrial', status: 'Available' },
  { id: 106, regionId: 5, title: 'Developing Zone Plot', size: '2500 sqft', price: '₹40L', type: 'Mixed Use', status: 'Available' },
  { id: 107, regionId: 39, title: 'Premium Commercial Spot', size: '1000 sqft', price: '₹2Cr', type: 'Commercial', status: 'Available' },
  { id: 108, regionId: 38, title: 'Coaching Center Space', size: '3000 sqft', price: '₹1.8Cr', type: 'Commercial', status: 'Under Negotiation' }
];