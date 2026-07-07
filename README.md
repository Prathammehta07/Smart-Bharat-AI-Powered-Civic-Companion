# Smart Bharat — AI-Powered Civic Companion
**Empowering Citizens. Simplifying Governance. Better Governance. Stronger India.**

Smart Bharat is a full-stack, GenAI-powered civic platform designed to simplify government administration and empower Indian citizens to access social welfare benefits, explore public service requirements, and lodge & track local civic grievances in multiple Indian languages (English, Hindi, Tamil, Bengali, Marathi).

---

## 🚀 Key Features

1. **AI Civic Assistant (Conversational Core)**
   - Translates bureaucratic legalese into warm, plain, simplified explanations.
   - Grounded RAG (Retrieval-Augmented Generation) lookup from local databases.
   - Dynamic Tool Calling: Automatically executes background tasks (service searches, filing complaints, retrieving status timelines) based on user conversations.
   - Fallback simulation mode if Gemini API key is not configured.

2. **Government Services Directory**
   - A searchable, categorizable catalog of 15 essential central and state services (Aadhaar, PAN, Voter ID, Passport, Ration Card, Certificates, etc.).
   - Full checklists for required documents, detailed process steps, and links to official portals.

3. **Civic Complaint Lodging & Tracking**
   - Submit grievances (roads, sanitation, water, electricity, safety) either via a structured form or directly in chat.
   - Track progress live with a visual vertical timeline and resolution history logs.
   - Built-in status simulation controls for quick demonstration of state transitions.

4. **Welfare Scheme Personalization ("Schemes for You")**
   - A demographic profile wizard that matches eligibility (age, occupation, income, state) against social welfare schemes.
   - Returns customized scheme recommendations with a clear "Why it fits you" explanation.

5. **Multilingual Chrome & Language Support**
   - Multi-lingual UI toggle across 5 major languages: English, हिंदी, தமிழ், বাংলা, मराठी.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS v4, Lucide React (Icons).
- **Backend:** Node.js, Express, TypeScript, SQLite (Database for rapid demo setup).
- **AI Service:** Google GenAI SDK (Gemini 2.5/3.5 models) with local retrieval keyword match (RAG) and tool execution.

### Monorepo Structure
```
bharat/
├── package.json               # Root monorepo runner (concurrently starts both projects)
├── backend/                   # Node.js + Express API + SQLite Setup
│   ├── src/db.ts              # Database schema definition
│   ├── src/seed.ts            # Seeder: 15 services, 10 schemes, 6 complaints, 25 RAG chunks
│   ├── src/services/ai.ts     # Gemini SDK + local tool-calling definitions & mock fallback
│   └── src/index.ts           # App entry & endpoint mounting
└── frontend/                  # React + Tailwind v4 + TypeScript UI
    ├── src/components/        # Sub-panels (Header, HeroChat, Services, Complaints, Schemes, Footer)
    └── src/App.tsx            # Main layout and client routing
```

---

## 🏁 Quick Start Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Install Dependencies
Run from the root directory to install packages for the root, frontend, and backend workspaces:
```bash
npm run install:all
```

### 2. Configure Environment Variables (Optional)
To use the live Gemini GenAI model, create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```
*Note: If no key is set, the backend automatically falls back to the robust Mock AI simulation mode using local database records, making the app fully interactive out-of-the-box.*

### 3. Run the App
Launch both the frontend and backend servers concurrently:
```bash
npm run dev
```
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🏆 Hackathon Demo Highlights
- **Conversational Filing:** Try asking the chatbot *"I want to report a broken streetlight near my house"* or *"Is there any scheme for a farmer?"* and watch the assistant automatically execute functions and suggest page redirections.
- **State Progression Simulator:** Go to **Track Complaints**, click **Advance State**, and watch the visual status pipeline update in real-time.
- **Multilingual Toggle:** Instantly translate the interface at the top header or the bottom strip.
