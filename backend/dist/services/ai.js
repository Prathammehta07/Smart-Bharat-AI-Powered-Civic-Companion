"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatResponse = getChatResponse;
const genai_1 = require("@google/genai");
const db_js_1 = require("../db.js");
// Configuration
const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = 'gemini-2.5-flash';
// AI System Prompt instructing the companion on formatting, factual answers, citations, language preferences, and tool invocation.
const SYSTEM_PROMPT = `You are "Smart Bharat Companion", a friendly, empathetic, and knowledgeable GenAI civic assistant.
Your goal is to help Indian citizens simplify bureaucratic/government processes, answer questions about schemes, find services, and report or track civic complaints.

Strict Guidelines:
1. Simplify Legalese: Translate bureaucratic jargon into plain, warm, and highly readable instructions.
2. Grounded Answers: Base your answers on the retrieved database or context. Do not invent schemes, details, requirements, or portal links.
3. Citations & Official Portals: Always mention the name of the official scheme/service and provide the official portal URL if available. Add a standard disclaimer that citizens should verify crucial details on official portals.
4. Language Preferences: Respond in the user's preferred language (e.g. Hindi, Tamil, Bengali, Marathi) if they write in it or explicitly request it, otherwise default to English. Maintain a polite and helpful tone.
5. Clarifying Questions: If a request is vague (e.g. "How to get a caste certificate?"), ask clarifying questions (e.g. "Which state do you reside in?").
6. Tool Calls: You have access to tools/functions (searchServices, getDocumentChecklist, recommendSchemes, fileComplaint, getComplaintStatus). Trigger them whenever the user intent matches (e.g. "I want to file a pothole complaint", "What documents are required for PM Kisan?").
`;
// Initialize GoogleGenAI SDK if key is provided
let aiClient = null;
if (apiKey) {
    try {
        aiClient = new genai_1.GoogleGenAI({ apiKey });
        console.log('Gemini AI Client initialized successfully.');
    }
    catch (error) {
        console.error('Failed to initialize Gemini AI Client:', error);
    }
}
else {
    console.log('No GEMINI_API_KEY environment variable found. Falling back to Mock AI Simulator.');
}
// Simple RAG context retriever based on keywords
async function getRagContext(query) {
    const db = await (0, db_js_1.getDb)();
    const words = query.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2);
    if (words.length === 0)
        return '';
    // Simple keyword matching search in knowledge base
    const placeholders = words.map(() => 'keywords LIKE ?').join(' OR ');
    const params = words.map(w => `%${w}%`);
    try {
        const matches = await db.all(`SELECT source_type, content_chunk FROM knowledge_base WHERE ${placeholders} LIMIT 4`, params);
        if (matches.length === 0)
            return '';
        return matches.map(m => `[Source: ${m.source_type.toUpperCase()}]\n${m.content_chunk}`).join('\n\n');
    }
    catch (e) {
        console.error('RAG context retrieval failed:', e);
        return '';
    }
}
// Tool definitions for Google GenAI Tool Calling
const tools = [
    {
        functionDeclarations: [
            {
                name: 'searchServices',
                description: 'Search the database of government services for a query (e.g. passport, birth certificate, driving license).',
                parameters: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        query: { type: genai_1.Type.STRING, description: 'Search keywords.' }
                    },
                    required: ['query']
                }
            },
            {
                name: 'getDocumentChecklist',
                description: 'Get the exact checklist of documents needed for a specific government service or scheme.',
                parameters: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        titleOrId: { type: genai_1.Type.STRING, description: 'Title or ID of the service/scheme.' }
                    },
                    required: ['titleOrId']
                }
            },
            {
                name: 'recommendSchemes',
                description: 'Recommend welfare schemes based on a citizen profile (occupation, income, age, state).',
                parameters: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        occupation: { type: genai_1.Type.STRING, description: 'Citizen occupation (e.g. Farmer, Student, Artisan).' },
                        annualIncome: { type: genai_1.Type.INTEGER, description: 'Family annual income in Rupees.' },
                        age: { type: genai_1.Type.INTEGER, description: 'Citizen age.' },
                        state: { type: genai_1.Type.STRING, description: 'State of residence.' }
                    }
                }
            },
            {
                name: 'fileComplaint',
                description: 'File a civic complaint about public infrastructure, sanitation, safety, roads, or utility issues.',
                parameters: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        category: { type: genai_1.Type.STRING, enum: ['roads', 'sanitation', 'water', 'electricity', 'public safety', 'other'], description: 'Category of complaint.' },
                        description: { type: genai_1.Type.STRING, description: 'Detailed description of the issue.' },
                        locationText: { type: genai_1.Type.STRING, description: 'Address or landmark of the issue.' }
                    },
                    required: ['category', 'description', 'locationText']
                }
            },
            {
                name: 'getComplaintStatus',
                description: 'Fetch the status and history timeline of a complaint by its ticket ID.',
                parameters: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        complaintId: { type: genai_1.Type.STRING, description: 'Complaint ticket ID (e.g. cmp-001).' }
                    },
                    required: ['complaintId']
                }
            }
        ]
    }
];
// Helper database tools handlers
const toolHandlers = {
    searchServices: async ({ query }) => {
        const db = await (0, db_js_1.getDb)();
        const results = await db.all(`SELECT id, title, category, description, portal_url, avg_processing_days 
       FROM services WHERE title LIKE ? OR category LIKE ? OR description LIKE ? LIMIT 5`, [`%${query}%`, `%${query}%`, `%${query}%`]);
        return { results };
    },
    getDocumentChecklist: async ({ titleOrId }) => {
        const db = await (0, db_js_1.getDb)();
        const service = await db.get(`SELECT title, documents_json FROM services WHERE id = ? OR title LIKE ? LIMIT 1`, [titleOrId, `%${titleOrId}%`]);
        if (service) {
            return { title: service.title, documents: JSON.parse(service.documents_json) };
        }
        const scheme = await db.get(`SELECT title, documents_json FROM schemes WHERE id = ? OR title LIKE ? LIMIT 1`, [titleOrId, `%${titleOrId}%`]);
        if (scheme) {
            return { title: scheme.title, documents: JSON.parse(scheme.documents_json) };
        }
        return { error: 'Service or scheme not found.' };
    },
    recommendSchemes: async ({ occupation, annualIncome, age, state }) => {
        const db = await (0, db_js_1.getDb)();
        const schemes = await db.all('SELECT * FROM schemes');
        const matched = [];
        for (const s of schemes) {
            const el = JSON.parse(s.eligibility_json);
            let match = true;
            if (el.occupation && occupation && el.occupation.toLowerCase() !== occupation.toLowerCase()) {
                match = false;
            }
            if (el.maxIncome && annualIncome && annualIncome > el.maxIncome) {
                match = false;
            }
            if (el.maxAge && age && age > el.maxAge) {
                match = false;
            }
            if (el.minAge && age && age < el.minAge) {
                match = false;
            }
            if (match) {
                matched.push({
                    id: s.id,
                    title: s.title,
                    category: s.category,
                    benefits: s.benefits,
                    whyFits: `Matches occupation (${occupation || 'Any'}) and fits within eligibility requirements.`
                });
            }
        }
        return { recommendations: matched.slice(0, 3) };
    },
    fileComplaint: async ({ category, description, locationText }) => {
        const db = await (0, db_js_1.getDb)();
        const id = `cmp-${Math.floor(1000 + Math.random() * 9000)}`;
        const citizen_id = 'demo-citizen-123'; // Default demo citizen
        const timeline = [
            { status: 'Submitted', time: new Date().toISOString(), note: 'Complaint logged conversationally via AI Assistant.' }
        ];
        await db.run(`INSERT INTO complaints (id, citizen_id, category, description, location_text, status, timeline_json) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, citizen_id, category, description, locationText, 'Submitted', JSON.stringify(timeline)]);
        return { success: true, complaintId: id, status: 'Submitted', message: 'Complaint successfully filed.' };
    },
    getComplaintStatus: async ({ complaintId }) => {
        const db = await (0, db_js_1.getDb)();
        const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [complaintId]);
        if (!complaint) {
            return { error: `Complaint with ID ${complaintId} not found.` };
        }
        return {
            id: complaint.id,
            category: complaint.category,
            status: complaint.status,
            description: complaint.description,
            timeline: JSON.parse(complaint.timeline_json),
            updated_at: complaint.updated_at
        };
    }
};
// Generates Mock Response when GEMINI_API_KEY is not available
async function generateMockResponse(query) {
    const queryLower = query.toLowerCase();
    if (queryLower.includes('birth certificate') || queryLower.includes('birth register')) {
        const res = await toolHandlers.getDocumentChecklist({ titleOrId: 'srv-birth-cert' });
        return {
            text: `To get a **Birth Certificate Registration**, you need to register within 21 days of birth at your local municipal body or gram panchayat.
      
Here is the required document checklist:
${res.documents.map((d) => `- [ ] ${d}`).join('\n')}

You can apply online at the official Civil Registration System: https://crsorgi.gov.in/

*Disclaimer: Verify these details with your local registrar.*`,
            toolCalled: 'getDocumentChecklist',
            toolResult: res
        };
    }
    if (queryLower.includes('pm awas') || queryLower.includes('pothole') || queryLower.includes('pmay') || queryLower.includes('house')) {
        const res = await toolHandlers.getDocumentChecklist({ titleOrId: 'sch-pmay' });
        return {
            text: `For **Pradhan Mantri Awas Yojana (PMAY)**, the welfare scheme provides affordable housing with interest subsidies of up to 6.5% for EWS, LIG, and MIG families.

Here is the document checklist:
${res.documents.map((d) => `- [ ] ${d}`).join('\n')}

*Disclaimer: Ensure your annual income fits the eligibility categories.*`,
            toolCalled: 'getDocumentChecklist',
            toolResult: res
        };
    }
    if (queryLower.includes('pm kisan') || queryLower.includes('farmer') || queryLower.includes('agriculture')) {
        const res = await toolHandlers.recommendSchemes({ occupation: 'Farmer', annualIncome: 120000, age: 32 });
        return {
            text: `Based on your profile, here are recommended schemes:
1. **PM Kisan Samman Nidhi**: Direct financial aid of Rs. 6,000/year to small/marginal farmers.
2. **PM Vishwakarma**: Concessional loans and tool training.

*Disclaimer: Confirm your land registration matches PM Kisan conditions.*`,
            toolCalled: 'recommendSchemes',
            toolResult: res
        };
    }
    if (queryLower.includes('report') || queryLower.includes('file a complaint') || queryLower.includes('complaint') || queryLower.includes('leak') || queryLower.includes('garbage')) {
        let cat = 'roads';
        let desc = 'Reported issue';
        if (queryLower.includes('leak') || queryLower.includes('water')) {
            cat = 'water';
            desc = 'Water pipeline leak reported.';
        }
        else if (queryLower.includes('garbage') || queryLower.includes('sanitation')) {
            cat = 'sanitation';
            desc = 'Overflowing waste pile.';
        }
        const res = await toolHandlers.fileComplaint({
            category: cat,
            description: desc,
            locationText: 'Main Street, Ward 12'
        });
        return {
            text: `I have successfully filed a complaint for you.
- **Ticket ID**: ${res.complaintId}
- **Category**: ${cat.toUpperCase()}
- **Status**: Submitted

You can track its progress on the "My Complaints" tracker dashboard page.`,
            toolCalled: 'fileComplaint',
            toolResult: res
        };
    }
    if (queryLower.includes('status') || queryLower.includes('cmp-')) {
        const match = query.match(/cmp-\d+/i);
        const cmpId = match ? match[0].toLowerCase() : 'cmp-002';
        const res = await toolHandlers.getComplaintStatus({ complaintId: cmpId });
        if (res.error) {
            return { text: `Sorry, I couldn't find a complaint ticket named "${cmpId}".` };
        }
        return {
            text: `Here is the current status of complaint **${cmpId.toUpperCase()}** (${res.category.toUpperCase()}):
- **Current Status**: **${res.status}**
- **Description**: ${res.description}
- **Last Updated**: ${new Date(res.updated_at).toLocaleDateString()}

Timeline details:
${res.timeline.map((t) => `- [${t.status}] ${t.note}`).join('\n')}`,
            toolCalled: 'getComplaintStatus',
            toolResult: res
        };
    }
    // Fallback general search
    const searchRes = await toolHandlers.searchServices({ query });
    if (searchRes.results && searchRes.results.length > 0) {
        return {
            text: `I found these related services in our directory:
${searchRes.results.map((s) => `- **${s.title}** (${s.category}): ${s.description}`).join('\n')}

For full details, please visit the **Services Catalog** section!`,
            toolCalled: 'searchServices',
            toolResult: searchRes
        };
    }
    return {
        text: `Hello! I am your AI Companion. How can I help you today?
    
You can ask me questions like:
- "How to get a Birth Certificate?"
- "What documents are required for PM Awas Yojana?"
- "Check status of complaint cmp-002"
- "I want to report an overflowing garbage container near ward 4"`
    };
}
// Main chat function
async function getChatResponse(userMessage, history, lang = 'en') {
    if (!aiClient) {
        // Return mock response immediately if Gemini SDK key is missing
        return generateMockResponse(userMessage);
    }
    try {
        const ragContext = await getRagContext(userMessage);
        const contents = [
            ...history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            })),
            {
                role: 'user',
                parts: [{ text: `Selected UI Language: ${lang}\n\nContext:\n${ragContext}\n\nUser Question: ${userMessage}` }]
            }
        ];
        const response = await aiClient.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                tools: tools,
                temperature: 0.2
            }
        });
        const candidate = response.candidates?.[0];
        const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall);
        if (functionCalls && functionCalls.length > 0) {
            const fCall = functionCalls[0].functionCall;
            const toolName = fCall.name || '';
            const handler = toolHandlers[toolName];
            if (handler) {
                console.log(`Executing tool function call: ${fCall.name} with args`, fCall.args);
                const result = await handler(fCall.args);
                // Feed tool results back to the model for final conversational output
                const finalResponse = await aiClient.models.generateContent({
                    model: modelName,
                    contents: [
                        ...contents,
                        {
                            role: 'model',
                            parts: [{ functionCall: fCall }]
                        },
                        {
                            role: 'user',
                            parts: [{ text: `Tool result from ${fCall.name}: ${JSON.stringify(result)}` }]
                        }
                    ],
                    config: {
                        systemInstruction: SYSTEM_PROMPT,
                        temperature: 0.2
                    }
                });
                return {
                    text: finalResponse.text || 'I executed that command successfully.',
                    toolCalled: fCall.name,
                    toolResult: result
                };
            }
        }
        return {
            text: response.text || 'I am ready to assist you.'
        };
    }
    catch (error) {
        console.error('Error generating AI response:', error);
        return generateMockResponse(userMessage);
    }
}
