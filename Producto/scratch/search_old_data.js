const fs = require('fs');
const path = require('path');

const brainPath = "C:\\Users\\FLUSIZE\\.gemini\\antigravity\\brain";

function searchDir(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      // Look for transcript files or scratch/log files
      if (file.endsWith('.jsonl') || file.endsWith('.log') || (file.endsWith('.js') && !file.includes('search_old_data') && !file.includes('list_backups'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Let's search for signs of actual data e.g. "Reaction Mirror" session info or specific subjects
          if (content.includes('sesiones_clinicas') && (content.includes('Reaction Mirror') || content.includes('reaction') || content.includes('memory')) && content.includes('id_paciente')) {
            // Count how many times it shows up or print a matching snippet
            console.log(`Found possible data in file: ${fullPath} (Size: ${stat.size} bytes)`);
            if (file.endsWith('.jsonl')) {
              // Print some line snippets
              const lines = content.split('\n');
              lines.forEach((line, idx) => {
                if (line.includes('sesiones_clinicas') && (line.includes('"nombre"') || line.includes('"id_paciente"')) && line.length > 500) {
                  console.log(`  - Line ${idx} length ${line.length} (contains JSON-like data)`);
                }
              });
            }
          }
        } catch (e) {
          // Ignore read errors
        }
      }
    }
  });
}

console.log("Searching for old patient and game session data in brain logs...");
try {
  searchDir(brainPath);
  console.log("Search completed.");
} catch (e) {
  console.error("Search error:", e);
}
