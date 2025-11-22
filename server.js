const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function for API calls with better error handling
async function callAPI(endpoint) {
    try {
        console.log(`Calling API: ${BASE_URL}/${endpoint}`);
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            headers: { 
                'X-Auth-Token': API_KEY
            }
        });
        
        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`);
            throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`API Success: ${endpoint}`);
        return data;
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.message);
        throw error;
    }
}

// Get today's matches
app.get('/api/matches/today', async (req, res) => {
    try {
        const data = await callAPI('matches');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matches', message: error.message });
    }
});

// Get matches for a specific competition
app.get('/api/matches/:competitionCode', async (req, res) => {
    try {
        const { competitionCode } = req.params;
        const data = await callAPI(`competitions/${competitionCode}/matches`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matches', message: error.message });
    }
});

// Get standings
app.get('/api/standings/:competitionCode', async (req, res) => {
    try {
        const { competitionCode } = req.params;
        const data = await callAPI(`competitions/${competitionCode}/standings`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch standings', message: error.message });
    }
});

// Get team information
app.get('/api/team/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const data = await callAPI(`teams/${teamId}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team data', message: error.message });
    }
});

// Get head-to-head for a specific match
app.get('/api/match/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;
        const data = await callAPI(`matches/${matchId}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch match data', message: error.message });
    }
});

// Get all competitions
app.get('/api/competitions', async (req, res) => {
    try {
        const data = await callAPI('competitions');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch competitions', message: error.message });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`⚽ Methode's Football Hub running on http://localhost:${PORT}`);
    console.log(`🔑 API Key loaded: ${API_KEY ? 'Yes ✅' : 'No ❌'}`);
    console.log(`📊 Free Tier: 10 requests/minute`);
});
