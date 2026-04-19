const fs = require('fs');
const data = fs.readFileSync('src/data/mockData.ts', 'utf8');
const json = fs.readFileSync('src/data/mockHeatmapData.json', 'utf8');
const replaced = data.replace(/export const mockHeatmapData = \[[\s\S]*?\];/, 'export const mockHeatmapData = ' + json + ';');
fs.writeFileSync('src/data/mockData.ts', replaced);
console.log("Injected");
