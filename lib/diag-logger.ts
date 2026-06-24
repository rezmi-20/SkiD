import fs from 'fs';
import path from 'path';

export function writeLog(message: string) {
  try {
    const logPath = path.join(process.cwd(), 'auth-debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    console.log(`[DIAG_LOGGER] ${message}`);
  } catch (err) {
    console.error("Failed to write to diag log:", err);
  }
}
