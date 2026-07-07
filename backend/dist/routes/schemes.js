"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../db.js");
const router = (0, express_1.Router)();
// GET /api/schemes - List all schemes or filter by category
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const db = await (0, db_js_1.getDb)();
        let sql = 'SELECT * FROM schemes';
        const params = [];
        if (category) {
            sql += ' WHERE category = ?';
            params.push(category);
        }
        const schemes = await db.all(sql, params);
        const parsedSchemes = schemes.map(s => ({
            ...s,
            eligibility: s.eligibility_json ? JSON.parse(s.eligibility_json) : {},
            documents: s.documents_json ? JSON.parse(s.documents_json) : [],
            targetGroup: s.target_group_json ? JSON.parse(s.target_group_json) : []
        }));
        res.json(parsedSchemes);
    }
    catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// POST /api/schemes/recommend - Personalized schemes matching engine
router.post('/recommend', async (req, res) => {
    try {
        const { age, occupation, annualIncome, state, gender, isDifferentlyAbled } = req.body;
        const db = await (0, db_js_1.getDb)();
        const schemes = await db.all('SELECT * FROM schemes');
        const recommendations = [];
        for (const s of schemes) {
            const eligibility = s.eligibility_json ? JSON.parse(s.eligibility_json) : {};
            const targetGroup = s.target_group_json ? JSON.parse(s.target_group_json) : [];
            let score = 0;
            let reasons = [];
            // Check Occupation
            if (eligibility.occupation) {
                if (occupation && eligibility.occupation.toLowerCase() === occupation.toLowerCase()) {
                    score += 3;
                    reasons.push(`Direct fit for your occupation as a ${occupation}.`);
                }
                else {
                    continue; // strict mismatch
                }
            }
            // Check Income Limits
            if (eligibility.maxIncome) {
                if (annualIncome !== undefined && annualIncome !== null) {
                    if (annualIncome <= eligibility.maxIncome) {
                        score += 2;
                        reasons.push(`Your annual income of ₹${annualIncome.toLocaleString()} falls below the limit of ₹${eligibility.maxIncome.toLocaleString()}.`);
                    }
                    else {
                        continue; // strictly above income limit
                    }
                }
            }
            // Check Age limits
            if (eligibility.minAge) {
                if (age !== undefined && age < eligibility.minAge) {
                    continue; // strictly under-age
                }
            }
            if (eligibility.maxAge) {
                if (age !== undefined && age > eligibility.maxAge) {
                    continue; // strictly over-age
                }
            }
            // Check Gender limits
            if (eligibility.gender) {
                if (gender && eligibility.gender.toLowerCase() !== gender.toLowerCase()) {
                    continue; // strictly gender mismatch
                }
                else if (gender) {
                    score += 2;
                    reasons.push(`Exclusively designed for ${eligibility.gender} applicants.`);
                }
            }
            // Check Target groups matching demographics
            if (targetGroup.length > 0) {
                const matchesTarget = targetGroup.some((tg) => {
                    const tgl = tg.toLowerCase();
                    return ((tgl.includes('farmer') && occupation?.toLowerCase() === 'farmer') ||
                        (tgl.includes('women') && gender?.toLowerCase() === 'female') ||
                        (tgl.includes('youth') && age >= 15 && age <= 35) ||
                        (tgl.includes('elderly') && age >= 60) ||
                        (tgl.includes('rural') && (state?.toLowerCase().includes('pradesh') || state?.toLowerCase().includes('bihar') || state?.toLowerCase().includes('bengal'))));
                });
                if (matchesTarget) {
                    score += 1;
                    reasons.push('Matches your profile demographic target group.');
                }
            }
            // If we got here, they are eligible!
            score += 1; // baseline eligibility
            recommendations.push({
                id: s.id,
                title: s.title,
                category: s.category,
                description: s.description,
                benefits: s.benefits,
                documents: s.documents_json ? JSON.parse(s.documents_json) : [],
                reasons: reasons.length > 0 ? reasons : ['General scheme benefits for citizens.'],
                score
            });
        }
        // Sort by match score descending
        recommendations.sort((a, b) => b.score - a.score);
        res.json(recommendations);
    }
    catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
