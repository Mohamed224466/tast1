import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({ filename: './database.sqlite', driver: sqlite3.Database });
const cols = await db.all("PRAGMA table_info(videos)");
console.log(cols);
await db.close();
