const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration: Search for the Excel file in common locations
const EXCEL_FILENAME = 'Ultimate_Formula_Bank.xlsx';
const POSSIBLE_PATHS = [
  path.join(__dirname, EXCEL_FILENAME),
  path.join('D:', 'Downloaded files EDGE', EXCEL_FILENAME), // User's specific path
];

let workbook;
let foundPath = null;

for (const p of POSSIBLE_PATHS) {
  if (fs.existsSync(p)) {
    try {
      workbook = xlsx.readFile(p);
      foundPath = p;
      break;
    } catch (e) {
      console.error(`Found file at ${p} but could not read it:`, e.message);
    }
  }
}

if (!workbook) {
  console.error(`Error: Could not find ${EXCEL_FILENAME} in any of the expected locations:`);
  POSSIBLE_PATHS.forEach(p => console.error(` - ${p}`));
  process.exit(1);
}

console.log(`Extracting data from: ${foundPath}`);

try {
  let allFormulas = [];
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    // xlsx.utils.sheet_to_json handles headers by default.
    let data = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    
    data = data.map(item => {
      return {
        Branch: item.Branch || sheetName,
        FormulaName: item['Formula Name'] || item['FormulaName'] || '',
        Formula: item.Formula || '',
        Example: item.Example || '',
        Notes: item.Notes || ''
      };
    }).filter(i => i.FormulaName || i.Formula);
    
    allFormulas = allFormulas.concat(data);
  });
  
  fs.writeFileSync('data.json', JSON.stringify(allFormulas, null, 2));
  console.log('Extraction complete! Total items:', allFormulas.length);
} catch (e) {
  console.error("Error processing workbook:", e);
  process.exit(1);
}
