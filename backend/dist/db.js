"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
let dbInstance = null;
async function getDb() {
    if (dbInstance) {
        return dbInstance;
    }
    // Ensure database file is placed in backend directory
    const dbPath = path_1.default.resolve(process.cwd(), 'database.sqlite');
    dbInstance = await (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
    });
    // Enable foreign keys
    await dbInstance.run('PRAGMA foreign_keys = ON');
    // Initialize schemas
    await initializeSchemas(dbInstance);
    return dbInstance;
}
async function initializeSchemas(db) {
    // Citizens Table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS citizens (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      language_pref TEXT DEFAULT 'en',
      profile_json TEXT, -- Profile data for scheme personalization (JSON)
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);
    // Services Table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      eligibility_json TEXT, -- JSON array of eligibility conditions
      documents_json TEXT, -- JSON array of required documents (checklist)
      process_steps_json TEXT, -- JSON array of steps
      portal_url TEXT,
      avg_processing_days INTEGER DEFAULT 7
    )
  `);
    // Schemes Table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS schemes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      eligibility_json TEXT, -- JSON object of eligibility criteria
      benefits TEXT NOT NULL,
      documents_json TEXT, -- JSON array of required documents
      target_group_json TEXT -- JSON array of target demographics
    )
  `);
    // Complaints Table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      citizen_id TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      location_text TEXT,
      lat REAL,
      lng REAL,
      photo_url TEXT,
      status TEXT CHECK( status IN ('Submitted','Under Review','In Progress','Resolved') ) DEFAULT 'Submitted',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime')),
      timeline_json TEXT, -- History of status changes (JSON array of events)
      FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE CASCADE
    )
  `);
    // Knowledge Base Table (For simplified RAG search)
    await db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id TEXT PRIMARY KEY,
      source_type TEXT NOT NULL, -- 'service' or 'scheme' or 'faq'
      ref_id TEXT,
      content_chunk TEXT NOT NULL,
      keywords TEXT -- Space-separated keywords for searching
    )
  `);
    // Chat Sessions Table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      citizen_id TEXT,
      messages_json TEXT, -- JSON array of chat messages
      language TEXT DEFAULT 'en',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (citizen_id) REFERENCES citizens(id) ON DELETE SET NULL
    )
  `);
}
