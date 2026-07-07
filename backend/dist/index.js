"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = require("./db.js");
const seed_js_1 = require("./seed.js");
// Route Imports
const services_js_1 = __importDefault(require("./routes/services.js"));
const schemes_js_1 = __importDefault(require("./routes/schemes.js"));
const complaints_js_1 = __importDefault(require("./routes/complaints.js"));
const chat_js_1 = __importDefault(require("./routes/chat.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/services', services_js_1.default);
app.use('/api/schemes', schemes_js_1.default);
app.use('/api/complaints', complaints_js_1.default);
app.use('/api/chat', chat_js_1.default);
// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Initialize database and start server
async function startServer() {
    try {
        console.log('Connecting to SQLite database...');
        await (0, db_js_1.getDb)();
        console.log('Database connected successfully.');
        console.log('Running database seeders...');
        await (0, seed_js_1.seedDatabase)();
        app.listen(PORT, () => {
            console.log(`Smart Bharat Backend running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Fatal: Server startup failed:', error);
        process.exit(1);
    }
}
startServer();
