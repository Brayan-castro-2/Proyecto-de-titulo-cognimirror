const fs = require('fs');
const path = require('path');

const pathsToSearch = [
  "c:\\Users\\FLUSIZE\\Downloads\\TPY1101_001D_CastroBrayan",
  "C:\\backups"
];

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (err) {
        return; // Skip broken symlinks or locked files
      }
      if (stat && stat.isDirectory()) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'out' || file === 'build') {
          return; // Skip large build folders
        }
        results = results.concat(walk(fullPath));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.sql' || ext === '.csv' || (ext === '.json' && !file.includes('package') && !file.includes('tsconfig') && !file.includes('manifest') && !file.includes('profiles'))) {
          results.push({ path: fullPath, size: stat.size });
        }
      }
    });
  } catch (e) {
    // Permission denied or folder doesn't exist
  }
  return results;
}

console.log("Searching for backup files...");
pathsToSearch.forEach(p => {
  console.log(`Scanning: ${p}`);
  const files = walk(p);
  if (files.length > 0) {
    console.log(`Found ${files.length} potential files:`);
    files.forEach(f => {
      console.log(`- ${f.path} (${f.size} bytes)`);
    });
  } else {
    console.log("No files found.");
  }
});
console.log("Scan completed.");
