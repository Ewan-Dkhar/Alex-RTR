const fs = require('fs');

const rawCsv = fs.readFileSync('rent_data.csv', 'utf8');
const heatmapJsonStr = fs.readFileSync('src/data/mockHeatmapData.json', 'utf8');

const heatmapData = JSON.parse(heatmapJsonStr);

const lines = rawCsv.split('\n');

const rentMap = {};
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  if (line.startsWith('region,')) continue; // skip secondary headers

  const parts = line.split(',');
  const name = parts[0].trim();
  const rent2 = parseInt(parts[1].trim());
  const rent3 = parseInt(parts[2].trim());

  rentMap[name.toLowerCase()] = { rent2, rent3 };
}

let matchedCount = 0;
for (const plot of heatmapData) {
  const r = rentMap[plot.name.toLowerCase()];
  if (r) {
    plot.rent2bhk = r.rent2;
    plot.rent3bhk = r.rent3;
    matchedCount++;
  } else {
    // fallback if no exact match
    plot.rent2bhk = 15000 + Math.floor(Math.random() * 5000);
    plot.rent3bhk = 22000 + Math.floor(Math.random() * 5000);
  }
}

fs.writeFileSync('src/data/mockHeatmapData.json', JSON.stringify(heatmapData, null, 2));

console.log(`Matched ${matchedCount} out of ${heatmapData.length} plots with rent data.`);
