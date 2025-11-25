import fs from 'fs';
import path from 'path';

// Clean up logs older than 30 days
function cleanupOldLogs(): void {
  const logsDir = path.join(__dirname, '../logs');
  const now = Date.now();

  // Parse LOG_EXPIRY from environment variable or use default (30 days)
  const logExpiry = process.env.LOG_EXPIRY
    ? parseInt(process.env.LOG_EXPIRY, 10)
    : 30 * 24 * 60 * 60 * 1000;

  if (!fs.existsSync(logsDir)) {
    return;
  }

  const files = fs.readdirSync(logsDir);

  files.forEach(file => {
    const filePath = path.join(logsDir, file);

    // Skip if it's not a file (e.g., directories)
    if (!fs.statSync(filePath).isFile()) {
      return;
    }

    const stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > logExpiry) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old log file: ${file}`);
    }
  });
}

cleanupOldLogs();
