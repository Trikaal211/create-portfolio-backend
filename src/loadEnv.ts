import dotenv from 'dotenv';
import path from 'path';

// Resolve and load the .env file relative to the script directory to support Plesk IISNode execution CWD
dotenv.config({ path: path.resolve(__dirname, '../.env') });
