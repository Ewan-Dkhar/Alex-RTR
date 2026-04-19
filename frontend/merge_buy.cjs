const fs = require('fs');

const rawCsv = fs.readFileSync('property_listings.csv', 'utf8');
const heatmapJsonStr = fs.readFileSync('src/data/mockHeatmapData.json', 'utf8');

const heatmapData = JSON.parse(heatmapJsonStr);

const lines = rawCsv.split('\n');

const locationPrices = {};
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const parts = line.split(',');
  const location = parts[3].trim().toLowerCase();
  const price = parseFloat(parts[4].trim());

  if (!isNaN(price)) {
    if (!locationPrices[location]) {
      locationPrices[location] = [];
    }
    locationPrices[location].push(price);
  }
}

// Compute averages
const avgPrices = {};
for (const loc in locationPrices) {
  const prices = locationPrices[loc];
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  avgPrices[loc] = parseFloat(avg.toFixed(2));
}

let matchedCount = 0;
for (const plot of heatmapData) {
  const locKey = plot.name.toLowerCase();
  
  // try direct match
  let avgPrice = avgPrices[locKey];
  
  // try fuzzy match
  if (!avgPrice) {
    for (const key in avgPrices) {
      if (key.includes(locKey) || locKey.includes(key)) {
        avgPrice = avgPrices[key];
        break;
      }
    }
  }

  if (avgPrice) {
    plot.avgBuyPrice = avgPrice;
    matchedCount++;
  } else {
    // fallback if no match, maybe use the existing cost * some multiplier
    plot.avgBuyPrice = parseFloat((plot.cost * 1.2).toFixed(2));
  }
}

fs.writeFileSync('src/data/mockHeatmapData.json', JSON.stringify(heatmapData, null, 2));

console.log(`Matched ${matchedCount} out of ${heatmapData.length} plots with average buy prices.`);
