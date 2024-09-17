const fs = require('fs');

function parseLogFile(filePath) {
  const logData = fs.readFileSync(filePath, 'utf-8');
  const lines = logData.split('\n');
  return lines;
}

const logLines = parseLogFile('./qgames.log');
console.log(logLines);
