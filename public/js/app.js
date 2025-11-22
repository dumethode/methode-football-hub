// ============================================
// Methode's Football Hub - Application Logic
// ============================================

// State Management
const state = {
    currentTab: 'live',
    teams: [], // Store teams for the prediction engine
    standingsCache: {} // Cache to save API calls
};

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    navBtns: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    team1Select: document.getElementById('team1-select'),
    team2Select: document.getElementById('team2-select'),
    predictBtn: document.getElementById('predict-btn'),
    predictionResult: document.getElementById('prediction-result')
};

// Application Init
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadInitialData();
    setupPredictionEngine();
});

// ============================================
// Navigation & Setup
// ============================================
function initializeNavigation() {
    // 1. Navigation Buttons
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // 2. Header Tagline Links (New Feature)
    const tagLinks = document.querySelectorAll('.tag-link');
    tagLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tab = link.getAttribute('data-target');
            switchTab(tab);
        });
    });

    // 3. League Selector
    const leagueSelect = document.getElementById('league-select');
    if (leagueSelect) {
        leagueSelect.addEventListener('change', (e) => loadStandings(e.target.value));
    }
}

function switchTab(tab) {
    state.currentTab = tab;
    
    // Update Tab Content visibility
    elements.tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');

    // Update Navigation Button Active State
    elements.navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        }
    });

    // Load specific tab data
    switch(tab) {
        case 'live': loadLiveMatches(); break;
        case 'standings': loadStandings('PL'); break;
        case 'premier-league': loadLeagueSpecifics('PL', 'pl'); break;
        case 'la-liga': loadLeagueSpecifics('PD', 'laliga'); break;
    }
}

async function loadInitialData() {
    // Pre-load Premier League and La Liga for predictions
    await loadStandings('PL', false); 
    setTimeout(() => loadStandings('PD', false), 1000);
}

// ============================================
// API Handling
// ============================================
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`/api/${endpoint}`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.message || 'API Error');
        return data;
    } catch (err) {
        console.error('Fetch Error:', err);
        showError();
        return null;
    }
}

// ============================================
// Feature: Match Prediction Engine 🔮
// ============================================
function setupPredictionEngine() {
    if(elements.predictBtn) {
        elements.predictBtn.addEventListener('click', calculatePrediction);
    }
}

function updateTeamSelects(standingsData) {
    if (!standingsData.standings || standingsData.standings.length === 0) return;
    
    const table = standingsData.standings[0].table;
    if (!table) return;

    let newTeamsAdded = false;

    // Add teams to state if not already there
    table.forEach(row => {
        if (!state.teams.find(t => t.id === row.team.id)) {
            state.teams.push({
                id: row.team.id,
                name: row.team.shortName || row.team.name,
                points: row.points,
                gd: row.goalDifference,
                form: row.form, 
                position: row.position
            });
            newTeamsAdded = true;
        }
    });

    if (newTeamsAdded) {
        // Sort alphabetically
        state.teams.sort((a, b) => a.name.localeCompare(b.name));

        // Populate Dropdowns - Keep currently selected value if possible
        const val1 = elements.team1Select.value;
        const val2 = elements.team2Select.value;

        const options = state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        elements.team1Select.innerHTML = '<option value="">Select Home Team</option>' + options;
        elements.team2Select.innerHTML = '<option value="">Select Away Team</option>' + options;

        elements.team1Select.value = val1;
        elements.team2Select.value = val2;
    }
}

function calculatePrediction() {
    const id1 = parseInt(elements.team1Select.value);
    const id2 = parseInt(elements.team2Select.value);

    if (!id1 || !id2) {
        elements.predictionResult.innerHTML = '<p>Please select two teams!</p>';
        elements.predictionResult.classList.remove('hidden');
        return;
    }

    if (id1 === id2) {
        elements.predictionResult.innerHTML = '<p>Teams must be different!</p>';
        elements.predictionResult.classList.remove('hidden');
        return;
    }

    const t1 = state.teams.find(t => t.id === id1);
    const t2 = state.teams.find(t => t.id === id2);

    // Algorithm: Points Weight (60%) + Goal Difference (35%) + Home Advantage (5%)
    const score1 = (t1.points * 0.6) + (t1.gd * 0.35) + 5; 
    const score2 = (t2.points * 0.6) + (t2.gd * 0.35);

    let total = score1 + score2;
    if (total === 0) total = 1;

    const winProb1 = Math.round((score1 / total) * 100);
    const winProb2 = 100 - winProb1;

    let winnerText = winProb1 > winProb2 ? t1.name : t2.name;
    
    if (Math.abs(winProb1 - winProb2) < 10) winnerText = "Draw / Very Close Match";

    elements.predictionResult.classList.remove('hidden');
    elements.predictionResult.innerHTML = `
        <span class="pred-winner">Prediction: ${winnerText}</span>
        <div style="display: flex; gap: 10px; margin-top: 10px; align-items: center;">
            <div style="flex: 1; text-align: center;">
                <strong>${t1.name}</strong><br>
                <div style="background: #eee; height: 10px; border-radius: 5px; margin-top: 5px; overflow: hidden;">
                    <div style="background: var(--fifa-blue); width: ${winProb1}%; height: 100%;"></div>
                </div>
                <small>${winProb1}% Win Prob</small>
            </div>
            <div style="font-weight:bold; color:#888;">VS</div>
            <div style="flex: 1; text-align: center;">
                <strong>${t2.name}</strong><br>
                <div style="background: #eee; height: 10px; border-radius: 5px; margin-top: 5px; overflow: hidden;">
                    <div style="background: var(--danger-red); width: ${winProb2}%; height: 100%;"></div>
                </div>
                <small>${winProb2}% Win Prob</small>
            </div>
        </div>
        <p style="font-size: 0.8rem; margin-top: 15px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
            <strong>Analysis:</strong><br>
            ${t1.name}: ${t1.points} pts (GD: ${t1.gd})<br>
            ${t2.name}: ${t2.points} pts (GD: ${t2.gd})
        </p>
    `;
}

// ============================================
// Data Loading Functions
// ============================================

// Live Matches
async function loadLiveMatches() {
    showLoading();
    const data = await fetchAPI('matches/today');
    hideLoading();

    const container = document.getElementById('live-matches');
    if (!data || !data.matches || data.matches.length === 0) {
        container.innerHTML = '<div class="info-banner">No live matches today. Check the league tabs for upcoming fixtures! ⚽</div>';
        return;
    }
    
    container.innerHTML = data.matches.map(createMatchCard).join('');
}

// Standings
async function loadStandings(code, render = true) {
    if (render) showLoading();
    
    if (state.standingsCache[code]) {
        updateTeamSelects(state.standingsCache[code]);
        if (render) {
            document.getElementById('standings-table').innerHTML = createStandingsTable(state.standingsCache[code]);
            hideLoading();
        }
        return;
    }

    const data = await fetchAPI(`standings/${code}`);
    if (data) {
        state.standingsCache[code] = data;
        updateTeamSelects(data);
        if (render) {
            document.getElementById('standings-table').innerHTML = createStandingsTable(data);
        }
    }
    if (render) hideLoading();
}

// Specific Leagues
async function loadLeagueSpecifics(code, prefix) {
    showLoading();
    
    const matchesData = await fetchAPI(`matches/${code}`);
    const standingsData = await fetchAPI(`standings/${code}`);
    
    hideLoading();

    const matchesContainer = document.getElementById(`${prefix}-matches`);
    if (matchesData && matchesData.matches) {
        const upcoming = matchesData.matches
            .filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED' || m.status === 'IN_PLAY')
            .slice(0, 8);
        matchesContainer.innerHTML = upcoming.map(createMatchCard).join('');
    }

    const standingsContainer = document.getElementById(`${prefix}-standings`);
    if (standingsData) {
        updateTeamSelects(standingsData);
        standingsContainer.innerHTML = createStandingsTable(standingsData);
    }
}

// ============================================
// HTML Generators
// ============================================
function createMatchCard(match) {
    const d = new Date(match.utcDate);
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    const statusClass = match.status === 'IN_PLAY' || match.status === 'PAUSED' ? 'live' : 
                        match.status === 'FINISHED' ? 'finished' : 'scheduled';
    
    const statusText = match.status === 'IN_PLAY' ? 'LIVE 🔴' : 
                       match.status === 'FINISHED' ? 'FT' : timeStr;
    
    const competitionName = match.competition ? match.competition.name : 'Unknown League';

    return `
        <div class="match-card ${statusClass}">
            <div class="match-header">
                <span class="date">${competitionName} • ${dateStr}</span>
                <span class="status-badge status-${statusClass}">${statusText}</span>
            </div>
            <div class="teams-container">
                <div class="team-row">
                    <div class="team-name">
                        <img src="${match.homeTeam.crest}" alt="" class="team-crest">
                        ${match.homeTeam.shortName || match.homeTeam.name}
                    </div>
                    <span class="score">${match.score.fullTime.home ?? '-'}</span>
                </div>
                <div class="team-row">
                    <div class="team-name">
                        <img src="${match.awayTeam.crest}" alt="" class="team-crest">
                        ${match.awayTeam.shortName || match.awayTeam.name}
                    </div>
                    <span class="score">${match.score.fullTime.away ?? '-'}</span>
                </div>
            </div>
        </div>
    `;
}

function createStandingsTable(data) {
    if (!data.standings || data.standings.length === 0) return '<p class="error">No standings available for this competition.</p>';
    
    const table = data.standings[0].table;
    return `
        <table class="standings-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>Pts</th>
                </tr>
            </thead>
            <tbody>
                ${table.map(row => `
                    <tr>
                        <td><span class="pos-num">${row.position}</span></td>
                        <td>
                            <div class="team-cell">
                                <img src="${row.team.crest}" alt="" style="width:20px; height:20px;">
                                ${row.team.shortName || row.team.name}
                            </div>
                        </td>
                        <td>${row.playedGames}</td>
                        <td>${row.won}</td>
                        <td>${row.draw}</td>
                        <td>${row.lost}</td>
                        <td style="font-weight:800; color:var(--fifa-blue);">${row.points}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ============================================
// UI Helpers
// ============================================
function showLoading() { elements.loading.classList.remove('hidden'); elements.error.classList.add('hidden'); }
function hideLoading() { elements.loading.classList.add('hidden'); }
function showError() { elements.loading.classList.add('hidden'); elements.error.classList.remove('hidden'); }
