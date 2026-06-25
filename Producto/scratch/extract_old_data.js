const fs = require('fs');
const path = require('path');

const transcriptPath = "C:\\Users\\FLUSIZE\\.gemini\\antigravity\\brain\\5f645655-b0cb-47b2-8c5c-eb824180caba\\.system_generated\\logs\\transcript.jsonl";

function run() {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  console.log(`Processing ${lines.length} lines in transcript...`);

  let foundData = [];
  lines.forEach((line, idx) => {
    if (!line.trim()) return;
    try {
      const obj = JSON.parse(line);
      const contentStr = JSON.stringify(obj.content || "");
      
      // Let's search for JSON data in contentStr
      // If there are large JSON arrays of patients or sessions printed in the log
      // e.g. [{"id":"...", "nombre":"..."}]
      const matches = contentStr.match(/\[\s*\{\s*"id"\s*:\s*"[^"]+"\s*,\s*"nombre"/gi);
      if (matches) {
        console.log(`Line ${idx} matches patient array structure!`);
        // Let's try to extract the array
        const startIdx = contentStr.indexOf('[{');
        if (startIdx !== -1) {
          // Find matching closing bracket
          let bracketCount = 0;
          let endIdx = -1;
          for (let i = startIdx; i < contentStr.length; i++) {
            if (contentStr[i] === '[') bracketCount++;
            if (contentStr[i] === ']') {
              bracketCount--;
              if (bracketCount === 0) {
                endIdx = i;
                break;
              }
            }
          }
          if (endIdx !== -1) {
            const potentialJsonStr = contentStr.substring(startIdx, endIdx + 1).replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\r/g, '');
            try {
              const parsed = JSON.parse(potentialJsonStr);
              console.log(`Successfully parsed patient array on line ${idx} containing ${parsed.length} items.`);
              foundData.push({ type: 'pacientes', data: parsed });
            } catch (err) {
              console.log(`Failed to parse extracted JSON string: ${err.message}`);
            }
          }
        }
      }

      // Similarly search for sessions array e.g. [{"id":"...", "id_paciente":"..."}]
      const matchesSessions = contentStr.match(/\[\s*\{\s*"id"\s*:\s*"[^"]+"\s*,\s*"id_paciente"/gi) || contentStr.match(/\[\s*\{\s*"id_paciente"\s*:\s*"/gi);
      if (matchesSessions) {
        console.log(`Line ${idx} matches session array structure!`);
        const startIdx = contentStr.indexOf('[{');
        if (startIdx !== -1) {
          let bracketCount = 0;
          let endIdx = -1;
          for (let i = startIdx; i < contentStr.length; i++) {
            if (contentStr[i] === '[') bracketCount++;
            if (contentStr[i] === ']') {
              bracketCount--;
              if (bracketCount === 0) {
                endIdx = i;
                break;
              }
            }
          }
          if (endIdx !== -1) {
            const potentialJsonStr = contentStr.substring(startIdx, endIdx + 1).replace(/\\"/g, '"').replace(/\\n/g, '').replace(/\\r/g, '');
            try {
              const parsed = JSON.parse(potentialJsonStr);
              console.log(`Successfully parsed session array on line ${idx} containing ${parsed.length} items.`);
              foundData.push({ type: 'sesiones', data: parsed });
            } catch (err) {
              console.log(`Failed to parse extracted session JSON string: ${err.message}`);
            }
          }
        }
      }

      // Check for results_juego_reaccion/memoria
      if (contentStr.includes('resultados_juego_reaccion') && contentStr.includes('latencia_ms') && contentStr.includes('[{')) {
        console.log(`Line ${idx} might contain results_juego_reaccion data.`);
      }

    } catch (e) {
      // Line is not valid JSON
    }
  });

  // Save parsed data to a json file to inspect
  if (foundData.length > 0) {
    fs.writeFileSync('scratch/extracted_data_raw.json', JSON.stringify(foundData, null, 2));
    console.log("Wrote raw extracted data to scratch/extracted_data_raw.json");
  } else {
    console.log("No data arrays found in transcript lines.");
  }
}

run();
