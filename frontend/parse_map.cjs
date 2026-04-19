const fs = require('fs');

const rawData = `region,lat,lon,avg_price_per_sqft,price_band,growth_5yr_percent,demand_level,infrastructure_score,zone_type,roi_category,best_for
Rajajipuram,26.8450,80.8800,3500,Medium,30,High,6,Residential,Medium,Local Shops|Housing
Ashiyana,26.7900,80.9200,4500,Medium,40,Medium,7,Residential,Medium,Residential Business
Krishna Nagar,26.8000,80.9000,4300,Medium,38,Medium,7,Residential,Medium,Local Retail
Transport Nagar,26.7900,80.9000,4000,Medium,35,Medium,7,Industrial,High,Logistics|Transport
Dubagga,26.8300,80.8600,2800,Low-Medium,30,Medium,5,Developing,Medium,Small Business
Mohanlalganj,26.7000,81.0000,2500,Low,70,Low,5,Outer Growth,High,Long-term Investment
Gosainganj,26.7500,81.0500,2600,Low,65,Low,5,Outer Growth,High,Industrial|Farming
Bakshi Ka Talab,26.9300,80.9000,2700,Low-Medium,60,Medium,6,Growth,High,Warehousing
Safedabad,26.8800,81.0900,4200,Medium,68,Medium,7,Growth,High,Residential Expansion
Tiwariganj,26.8700,81.0800,4000,Medium,66,Medium,7,Growth,High,Investment
Uattardhona,26.8900,81.0700,3800,Medium,62,Medium,7,Growth,High,Residential Projects
Takrohi,26.8800,80.9900,4200,Medium,55,Medium,6,Residential,Medium,Shops|Services
Munshi Pulia,26.9000,80.9800,4500,Medium,50,High,7,Developed,Medium,Local Shops
Kalyanpur,26.9000,80.9500,4200,Medium,48,High,6,Residential,Medium,Local Business
Vikas Nagar,26.9100,80.9600,6000,High,35,Medium,7,Premium,Low,Residential
Nishatganj,26.8600,80.9400,5500,Medium-High,32,Medium,7,Developed,Medium,Retail
Nawabganj,26.8800,80.9100,3500,Medium,30,Medium,6,Residential,Medium,Local Shops
Balaganj,26.8400,80.9000,3200,Low-Medium,28,Medium,5,Old City,Medium,Traditional Business
Para Road,26.8000,80.8800,3000,Low-Medium,35,Medium,5,Developing,Medium,Low-cost Setup
Deva Road,26.8900,81.1000,3500,Medium,60,Medium,7,Growth,High,Investment
Amity University Road,26.8700,81.0500,4200,Medium,65,Medium,7,Growth,High,Student Business
Kapoorthala,26.8900,80.9600,5200,Medium-High,35,High,8,Commercial,Medium,Shops|Retail
Indraprastha,26.8700,80.9600,3800,Medium,50,Medium,6,Residential,Medium,Local Shops
Anora Kala,26.8900,81.0800,4200,Medium,60,Medium,7,Growth,High,Residential Growth
Matiyari,26.8800,81.0600,3800,Medium,58,Medium,7,Growth,High,Investment
Ismailganj,26.8700,81.0400,3500,Medium,55,Medium,6,Developing,Medium,Residential
Chinhat,26.8800,81.0600,4200,Medium,60,High,7,Growth,High,Shops|Cloud Kitchen
Malhaur,26.8700,81.0300,4500,Medium,65,Medium,7,Growth,High,Residential|Retail
Bijnor Road,26.7500,80.9000,4000,Medium,60,Medium,7,Industrial Growth,High,Logistics|Airport Business
Raebareli Road,26.7800,80.9000,2800,Low-Medium,38,Medium,6,Developing,Medium,Warehousing
Kanpur Road,26.7800,80.8800,3200,Medium,40,Medium,7,Developing,Medium,Transport Business
Shaheed Path,26.8200,81.0000,6900,High,55,High,10,Premium Growth,High,Corporate Offices
Sultanpur Road,26.7800,81.0200,4300,Medium,70,Medium,9,Growth,High,Warehousing|Expansion
Faizabad Road,26.8800,81.0400,3000,Low-Medium,50,High,8,Growth,High,Mixed Business
Sitapur Road,26.9000,80.9200,2500,Low,45,High,5,Budget,Medium,Kirana|Low-cost Shops
Kursi Road,26.9100,80.9500,3000,Low-Medium,50,High,6,Budget Growth,High,Small Business
Jankipuram,26.9200,80.9400,4200,Medium,35,High,6,Residential,Medium,Local Shops
Aliganj,26.8800,80.9400,6500,High,40,High,7,Developed,Medium,Coaching|Retail
Hazratganj,26.8500,80.9300,16000,Very High,30,Very High,10,Commercial Core,Medium,Luxury Retail
Charbagh,26.8300,80.9200,5000,Medium-High,35,Very High,9,Commercial Core,Medium,Hotels|Food
Aminabad,26.8400,80.9100,5500,Medium-High,32,Very High,8,Commercial Core,Medium,Clothing|Retail
Chowk,26.8600,80.9000,5200,Medium,28,High,7,Old Commercial,Medium,Traditional Business
Kaiserbagh,26.8500,80.9200,5300,Medium,30,High,8,Commercial Core,Medium,Legal|Offices
Vrindavan Yojna,26.7800,80.9500,4800,Medium,45,Medium,8,Planned,Medium,Residential|Offices
Alambagh,26.8000,80.9000,4200,Medium,30,High,8,Developed,Medium,Retail|Transport`;

const lines = rawData.split('\n');
const results = [];
let idCounter = 1;

for (const line of lines) {
  if (!line.trim() || line.startsWith('region')) continue;
  
  const parts = line.split(',');
  if (parts.length >= 11) {
    const name = parts[0].trim();
    const lat = parseFloat(parts[1].trim());
    const lng = parseFloat(parts[2].trim());
    const avgPrice = parseInt(parts[3].trim());
    const roi = parseInt(parts[5].trim());
    const type = parts[8].trim();
    
    // Convert avg_price_per_sqft to Lakhs for 1000 sqft
    const cost = avgPrice / 100;
    
    results.push({
      id: idCounter++,
      name: name,
      lat: lat,
      lng: lng,
      cost: cost,
      roi: roi,
      type: type
    });
  }
}

fs.writeFileSync('src/data/mockHeatmapData.json', JSON.stringify(results, null, 2));
console.log(results.length);
