const fs = require('fs');
const path = require('path');

// Clean up logs older than 30 days
function cleanupOldLogs() {
  const logsDir = path.join(__dirname, '../logs');
  const now = Date.now();
  const thirtyDaysAgo = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  if (!fs.existsSync(logsDir)) {
    return;
  }

  const files = fs.readdirSync(logsDir);
  
  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    
    if (now - stats.mtimeMs > thirtyDaysAgo) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old log file: ${file}`);
    }
  });
}

cleanupOldLogs();