const fs = require('fs');
try {
  const content = fs.readFileSync('models.json', 'utf16le');
  const lines = content.split('\n');
  // Skip first line and join the rest
  const jsonContent = lines.slice(1).join('\n');
  const jsonData = JSON.parse(jsonContent);
  const models = jsonData.models.map(m => m.name);
  console.log("AVAILABLE MODELS:", models);
} catch (e) {
  console.error("Error:", e);
}
