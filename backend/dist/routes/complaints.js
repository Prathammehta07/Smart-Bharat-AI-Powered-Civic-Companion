"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../db.js");
const router = (0, express_1.Router)();
// GET /api/complaints - Get all complaints, with optional citizenId filter
router.get('/', async (req, res) => {
    try {
        const { citizenId } = req.query;
        const db = await (0, db_js_1.getDb)();
        let complaints;
        if (citizenId) {
            complaints = await db.all('SELECT * FROM complaints WHERE citizen_id = ? ORDER BY created_at DESC', [citizenId]);
        }
        else {
            complaints = await db.all('SELECT * FROM complaints ORDER BY created_at DESC');
        }
        const parsedComplaints = complaints.map(c => ({
            ...c,
            timeline: c.timeline_json ? JSON.parse(c.timeline_json) : []
        }));
        res.json(parsedComplaints);
    }
    catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/complaints/:id - Get detail of a specific complaint
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, db_js_1.getDb)();
        const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [id]);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        res.json({
            ...complaint,
            timeline: complaint.timeline_json ? JSON.parse(complaint.timeline_json) : []
        });
    }
    catch (error) {
        console.error('Error fetching complaint detail:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// POST /api/complaints - Submit a new complaint
router.post('/', async (req, res) => {
    try {
        const { category, description, location_text, lat, lng, photo_url } = req.body;
        if (!category || !description) {
            return res.status(400).json({ error: 'Category and description are required.' });
        }
        const db = await (0, db_js_1.getDb)();
        const id = `cmp-${Math.floor(1000 + Math.random() * 9000)}`;
        const citizen_id = 'demo-citizen-123'; // Default demo citizen
        const timeline = [
            {
                status: 'Submitted',
                time: new Date().toISOString(),
                note: 'Complaint lodged successfully via Smart Bharat Portal.'
            }
        ];
        await db.run(`INSERT INTO complaints (id, citizen_id, category, description, location_text, lat, lng, photo_url, status, timeline_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            citizen_id,
            category,
            description,
            location_text || '',
            lat || null,
            lng || null,
            photo_url || '',
            'Submitted',
            JSON.stringify(timeline)
        ]);
        res.status(201).json({
            success: true,
            complaintId: id,
            status: 'Submitted',
            timeline
        });
    }
    catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// PATCH /api/complaints/:id/status - Update complaint status (for demo/simulation)
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;
        const allowedStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
        }
        const db = await (0, db_js_1.getDb)();
        const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', [id]);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }
        const timeline = complaint.timeline_json ? JSON.parse(complaint.timeline_json) : [];
        // Add new timeline state
        timeline.push({
            status,
            time: new Date().toISOString(),
            note: note || `Status updated to ${status}.`
        });
        const now = new Date().toISOString();
        await db.run(`UPDATE complaints 
       SET status = ?, timeline_json = ?, updated_at = ? 
       WHERE id = ?`, [status, JSON.stringify(timeline), now, id]);
        res.json({
            success: true,
            complaintId: id,
            status,
            timeline
        });
    }
    catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
