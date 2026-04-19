const fs = require('fs');

const rawData = `region,avg_price_per_sqft,price_band,growth_5yr_percent,demand_level,infrastructure_score,zone_type,roi_category,best_for
Rajajipuram,3500,Medium,30,High,6,Residential,Medium,Local Shops|Housing
Ashiyana,4500,Medium,40,Medium,7,Residential,Medium,Residential Business
Krishna Nagar,4300,Medium,38,Medium,7,Residential,Medium,Local Retail
Transport Nagar,4000,Medium,35,Medium,7,Industrial,High,Logistics|Transport
Dubagga,2800,Low-Medium,30,Medium,5,Developing,Medium,Small Business
Mohanlalganj,2500,Low,70,Low,5,Outer Growth,High,Long-term Investment
Gosainganj,2600,Low,65,Low,5,Outer Growth,High,Industrial|Farming
Bakshi Ka Talab,2700,Low-Medium,60,Medium,6,Growth,High,Warehousing
Safedabad,4200,Medium,68,Medium,7,Growth,High,Residential Expansion
Tiwariganj,4000,Medium,66,Medium,7,Growth,High,Investment
Uattardhona,3800,Medium,62,Medium,7,Growth,High,Residential Projects
Takrohi,4200,Medium,55,Medium,6,Residential,Medium,Shops|Services
Munshi Pulia,4500,Medium,50,High,7,Developed,Medium,Local Shops
Kalyanpur,4200,Medium,48,High,6,Residential,Medium,Local Business
Vikas Nagar,6000,High,35,Medium,7,Premium,Low,Residential
Nishatganj,5500,Medium-High,32,Medium,7,Developed,Medium,Retail
Nawabganj,3500,Medium,30,Medium,6,Residential,Medium,Local Shops
Balaganj,3200,Low-Medium,28,Medium,5,Old City,Medium,Traditional Business
Para Road,3000,Low-Medium,35,Medium,5,Developing,Medium,Low-cost Setup
Deva Road,3500,Medium,60,Medium,7,Growth,High,Investment
Amity University Road,4200,Medium,65,Medium,7,Growth,High,Student Business
Kapoorthala,5200,Medium-High,35,High,8,Commercial,Medium,Shops|Retail
Indraprastha,3800,Medium,50,Medium,6,Residential,Medium,Local Shops
Anora Kala,4200,Medium,60,Medium,7,Growth,High,Residential Growth
Matiyari,3800,Medium,58,Medium,7,Growth,High,Investment
Ismailganj,3500,Medium,55,Medium,6,Developing,Medium,Residential
Chinhat,4200,Medium,60,High,7,Growth,High,Shops|Cloud Kitchen
Malhaur,4500,Medium,65,Medium,7,Growth,High,Residential|Retail
Bijnor Road,4000,Medium,60,Medium,7,Industrial Growth,High,Logistics|Airport Business
Raebareli Road,2800,Low-Medium,38,Medium,6,Developing,Medium,Warehousing
Kanpur Road,3200,Medium,40,Medium,7,Developing,Medium,Transport Business
Shaheed Path,6900,High,55,High,10,Premium Growth,High,Corporate Offices
Sultanpur Road,4300,Medium,70,Medium,9,Growth,High,Warehousing|Expansion
Faizabad Road,3000,Low-Medium,50,High,8,Growth,High,Mixed Business
Sitapur Road,2500,Low,45,High,5,Budget,Medium,Kirana|Low-cost Shops
Kursi Road,3000,Low-Medium,50,High,6,Budget Growth,High,Small Business
Jankipuram,4200,Medium,35,High,6,Residential,Medium,Local Shops
Aliganj,6500,High,40,High,7,Developed,Medium,Coaching|Retail
Hazratganj,16000,Very High,30,Very High,10,Commercial Core,Medium,Luxury Retail
Charbagh,5000,Medium-High,35,Very High,9,Commercial Core,Medium,Hotels|Food
Aminabad,5500,Medium-High,32,Very High,8,Commercial Core,Medium,Clothing|Retail
Chowk,5200,Medium,28,High,7,Old Commercial,Medium,Traditional Business
Kaiserbagh,5300,Medium,30,High,8,Commercial Core,Medium,Legal|Offices
Vrindavan Yojna,4800,Medium,45,Medium,8,Planned,Medium,Residential|Offices
Alambagh,4200,Medium,30,High,8,Developed,Medium,Retail|Transport
Gomti Nagar,8400,High,60,High,9,Premium,Medium,Offices|Retail
Gomti Nagar Extension,7100,High,75,High,8,Growth,High,Investment|Startups
Indira Nagar,7000,High,45,High,8,Premium,Medium,Shops|Clinics
Mahanagar,14000,Very High,50,Medium,9,Premium,Medium,Luxury Retail
Vibhuti Khand,8500,Very High,60,High,10,Premium Commercial,High,Corporate Offices
Vineet Khand,8000,Very High,55,High,9,Premium,High,Luxury Residential
Viraj Khand,8200,Very High,58,High,9,Premium,High,Luxury Residential
Husainabad,5000,Medium,30,High,7,Old City,Medium,Food|Tourism Business
Thakurganj,3800,Medium,35,Medium,6,Old City,Medium,Local Shops
Saadatganj,3600,Medium,34,Medium,6,Old City,Medium,Residential Shops
Yahiyaganj,5200,Medium-High,32,High,7,Commercial,Medium,Wholesale Trade
Rakabganj,4800,Medium,30,High,7,Commercial,Medium,Retail
Naka Hindola,4500,Medium,33,High,7,Transport Hub,Medium,Hotels|Retail
Mawaiyya,4200,Medium,36,Medium,7,Developing,Medium,Residential Business
Alamnagar Extension,3700,Medium,42,Medium,6,Developing,Medium,Affordable Housing
Rajendra Nagar,4600,Medium,38,High,7,Residential,Medium,Local Shops
Manak Nagar,4000,Medium,35,Medium,7,Industrial,Medium,Workshops
Amausi Industrial Area,3500,Medium,50,Medium,8,Industrial Growth,High,Logistics|Warehouse
Sarojini Nagar,3800,Medium,55,Medium,7,Growth,High,Investment
Gaurabagh,3000,Low-Medium,40,Low,5,Outer Growth,Medium,Low-cost Setup
Rahim Nagar,5000,Medium-High,38,High,7,Developed,Medium,Shops|Retail
Khadra,4200,Medium,35,High,6,Residential,Medium,Local Shops
Nishatganj Extension,5600,Medium-High,35,Medium,7,Developed,Medium,Retail
Paper Mill Colony,4800,Medium,40,Medium,7,Residential,Medium,Housing
Indiranagar Sector 20,7200,High,45,High,8,Premium,Medium,Residential Business
Indiranagar Sector 14,7000,High,42,High,8,Premium,Medium,Clinics|Shops
Gomti Riverfront Area,9000,Very High,55,High,10,Premium,High,Tourism|Luxury Business
Kukrail,4200,Medium,50,Medium,7,Growth,High,Residential Expansion
Kukrail Picnic Spot Area,4500,Medium,52,Medium,7,Growth,High,Tourism Business
Sushant Golf City Extension,5000,High,65,Medium,8,Planned Growth,High,Investment
South City Phase 2,4800,Medium,50,Medium,7,Planned,Medium,Residential
South City Phase 3,4700,Medium,48,Medium,7,Planned,Medium,Housing
Eldeco Udyan,4600,Medium,45,Medium,7,Planned,Medium,Residential
Eldeco Greens,5000,High,50,Medium,8,Planned,Medium,Residential Business
Ansal API Area,5200,High,55,Medium,8,Planned Growth,High,Investment
Ansal Sushant Area,5400,High,60,Medium,8,Planned Growth,High,Residential|Retail
Janeshwar Mishra Park Area,8000,High,55,High,9,Premium,High,Commercial|Tourism
Kathauta Lake Area,7000,High,50,High,9,Premium,Medium,Cafes|Restaurants
Patrakarpuram,7500,High,45,High,9,Commercial,Medium,Retail|Food
DLF Garden City Area,6500,High,55,Medium,8,Planned,High,Residential|Investment
Omaxe Residency Area,5000,High,50,Medium,8,Planned,Medium,Residential
Daliganj Extension,4800,Medium,35,High,7,Central,Medium,Retail|Offices
Butler Colony,9000,Very High,30,Medium,9,Premium,Low,Luxury Residential
Cantt Area,8000,High,35,High,9,Premium,Medium,Offices|Housing
Cantonment Extension,7800,High,38,High,9,Premium,Medium,Residential
Dilkusha,8500,Very High,32,Medium,9,Premium,Low,Residential
Dilkusha Garden Area,8200,Very High,35,Medium,9,Premium,Low,Housing
La Martiniere Area,8800,Very High,40,High,9,Premium,Medium,Schools|Institutions
Rana Pratap Marg,9500,Very High,45,High,10,Commercial,Medium,Offices
Sapru Marg,10000,Very High,50,Very High,10,Commercial Core,Medium,Corporate Offices
MG Road Area,9500,Very High,48,Very High,10,Commercial Core,Medium,Retail
Park Road,9000,Very High,45,High,9,Commercial,Medium,Retail|Offices
Lohia Path Area,7000,High,50,Medium,8,Developed,Medium,Residential
Vikas Nagar Extension,6200,High,42,Medium,7,Developed,Medium,Residential
Kalyanpur Extension,4300,Medium,52,High,6,Growth,High,Local Shops
Jankipuram Extension Phase 2,4000,Medium,55,Medium,6,Growth,High,Residential Growth
Engineering College Road,4800,Medium,50,High,7,Growth,High,Student Business
Tedhi Pulia Area,5000,Medium-High,48,High,7,Developed,Medium,Shops|Retail
Ring Road Area,4200,Medium,60,Medium,8,Growth,High,Investment
Outer Ring Road,3500,Medium,65,Low,7,Outer Growth,High,Warehousing
Hardoi Road,3000,Low-Medium,45,Medium,6,Developing,Medium,Transport Business
Hardoi Bypass,2800,Low,55,Low,6,Outer Growth,High,Warehousing
Sitapur Bypass,2600,Low,50,Low,5,Outer Growth,Medium,Low-cost Setup
Faizabad Bypass,3200,Medium,60,Medium,7,Growth,High,Investment
Sultanpur Bypass,3500,Medium,68,Medium,8,Growth,High,Expansion
Raebareli Bypass,3000,Low-Medium,55,Low,6,Outer Growth,High,Industrial
Lucknow Airport Zone,4500,Medium,60,High,9,Airport Zone,High,Hotels|Logistics
Airport Road Extension,4200,Medium,58,Medium,8,Growth,High,Investment
Amausi Extension,3400,Medium,50,Medium,7,Growth,High,Industrial
Sarojini Nagar Phase 2,3600,Medium,60,Medium,7,Growth,High,Residential
Sarojini Nagar Phase 3,3500,Medium,62,Medium,7,Growth,High,Investment
Transport Nagar Extension,4200,Medium,40,Medium,8,Industrial,Medium,Logistics
Kanpur Road Extension,3300,Medium,45,Medium,7,Developing,Medium,Transport
Raebareli Road Extension,2900,Low-Medium,40,Medium,6,Developing,Medium,Warehousing
Bijnor Extension,3800,Medium,55,Medium,7,Industrial Growth,High,Logistics
Malhaur Extension,4600,Medium,65,Medium,7,Growth,High,Residential
Chinhat Extension Phase 2,4300,Medium,70,High,7,Growth,High,Shops
Chinhat Extension Phase 3,4200,Medium,72,High,7,Growth,High,Investment
Deva Road Extension,3600,Medium,62,Medium,7,Growth,High,Residential Growth
Matiyari Extension,3900,Medium,60,Medium,7,Growth,High,Investment
Anora Extension,4100,Medium,65,Medium,7,Growth,High,Residential
Safedabad Extension,4300,Medium,70,Medium,7,Growth,High,Expansion
Tiwariganj Extension,4200,Medium,68,Medium,7,Growth,High,Investment
Uattardhona Extension,3900,Medium,64,Medium,7,Growth,High,Residential
Gomti Nagar Phase 2,7800,High,60,High,9,Premium,Medium,Residential
Gomti Nagar Phase 3,7600,High,62,High,9,Premium,Medium,Offices
Gomti Nagar Phase 4,7400,High,65,High,9,Premium Growth,High,Investment
Riverfront Extension Area,8500,Very High,60,High,10,Premium,High,Tourism|Retail
Janeshwar Park Extension,8200,High,58,High,9,Premium,High,Commercial
Kathauta Extension,7200,High,55,High,9,Premium,Medium,Cafes
Patrakarpuram Extension,7600,High,50,High,9,Commercial,Medium,Retail
DLF Extension Area,6800,High,55,Medium,8,Planned,High,Residential
Omaxe Extension Area,5200,High,52,Medium,8,Planned,Medium,Residential
Eldeco Extension Area,5000,High,50,Medium,8,Planned,Medium,Residential
South City Extension,4800,Medium,48,Medium,7,Planned,Medium,Housing
Golf City Extension,5300,High,55,Medium,8,Planned,Medium,Residential`;

const lines = rawData.split('\n');
const results = [];
let idCounter = 1;

for (const line of lines) {
  if (!line.trim() || line.startsWith('region')) continue;
  
  const parts = line.split(',');
  if (parts.length >= 9) {
    const name = parts[0].trim();
    const avgPrice = parseInt(parts[1].trim());
    const roi = parseInt(parts[3].trim());
    const type = parts[6].trim();
    
    // Convert 3500 avg_price_per_sqft to 35 Lakhs for 1000 sqft
    const cost = avgPrice / 100;
    
    results.push({
      id: idCounter++,
      name: name,
      cost: cost,
      roi: roi,
      type: type
    });
  }
}

fs.writeFileSync('src/data/mockHeatmapData.json', JSON.stringify(results, null, 2));
console.log(results.length);
