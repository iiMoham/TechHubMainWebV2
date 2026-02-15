// Google Sheets Dashboard Configuration
const DASHBOARD_CONFIG = {
    'human-vs-ai': {
        sheetId: '1DoMo--gHFBv2lRbQKOGnf_p2SfE4ACI_YvxjOQKK5jA',
        range: 'Sheet1',
        columns: ['player', 'Results', 'Error', 'Rate', 'Date'],
        chartType: 'donut'
    },
    'fake-or-real': {
        sheetId: '1vnFddSk3KYrWUX5j5Tuzj2CDHM4vdTNy9X6WcaTefRg',
        range: 'Sheet1',
        columns: ['Timestamp', 'Player', 'Correct', 'Total', 'Accuracy', 'Wins', 'Losses', 'FakeRoundsSolved', 'SessionId', 'GameVersion'],
        chartType: 'donut'
    },
    'cybertrace': {
        sheetId: '1IcDLEPd_5SRl5E6rDNfrj5XwX1ntIXJB55tLwxirsZA',
        range: 'Sheet1',
        columns: ['Timestamp', 'Suspect', 'Correct'],
        chartType: 'donut'
    },
    'countdown': {
        sheetId: '19X_N1nNjI1dfpPxZCJoge_RiQ6KRrAsatRIwjJY_xBo',
        range: 'Sheet1',
        columns: ['Player', 'Time Diff (sec)', 'time-feedback', 'Result', 'Timestamp'],
        chartType: 'donut'
    },
    'guess-timeline': {
        sheetId: '1X97YkW6zTUAnNbYHYwP1RKYxarM510s0u_QFV3i42L8',
        range: 'Sheet1',
        columns: ['Player', 'Slot 1', 'Slot 2', 'Slot 3', 'Slot 4', 'Slot 5', 'Slot 6', 'Accuracy %', 'When'],
        chartType: 'bar'
    }
};

// Google Sheets API Key - Replace with your actual API key
const API_KEY = 'AIzaSyATBe02HBTA9gpCILwo1-EtJ29RXzn0zvs';

class GameDashboard {
    constructor() {
        this.initializeDashboards();
    }

    async initializeDashboards() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadAllDashboards());
        } else {
            this.loadAllDashboards();
        }
    }

    async loadAllDashboards() {
        const games = Object.keys(DASHBOARD_CONFIG);
        
        for (const game of games) {
            try {
                await this.loadGameDashboard(game);
            } catch (error) {
                console.error(`Error loading dashboard for ${game}:`, error);
                this.showError(game, 'Failed to load data');
            }
        }
    }

    async loadGameDashboard(gameId) {
        console.log(`Loading dashboard for: ${gameId}`);
        const config = DASHBOARD_CONFIG[gameId];
        const dashboardElement = document.getElementById(`dashboard-${gameId}`);
        
        if (!dashboardElement) {
            console.error(`Dashboard element not found for ${gameId}`);
            return;
        }

        try {
            // Show loading state
            this.showLoading(gameId);
            
            // Fetch data from Google Sheets
            const data = await this.fetchSheetData(config.sheetId, config.range);
            console.log(`Data fetched for ${gameId}:`, data);
            
            // Process and display data
            this.renderDashboard(gameId, data, config.columns);
            
        } catch (error) {
            console.error(`Error loading ${gameId} dashboard:`, error);
            this.showError(gameId, `Error: ${error.message}`);
        }
    }

    async fetchSheetData(sheetId, range) {
        console.log(`Fetching data for sheet: ${sheetId}, range: ${range}`);
        
        if (!API_KEY || API_KEY === 'YOUR_GOOGLE_SHEETS_API_KEY') {
            console.log('No API key configured, using mock data');
            // Return mock data for demonstration
            return this.getMockData();
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${API_KEY}`;
        console.log(`Fetching from URL: ${url}`);
        
        try {
            const response = await fetch(url);
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error: ${response.status} - ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Fetched data:', result);
            return result.values || [];
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        }
    }

    getMockData() {
        // Return sample data for demonstration based on game type
        console.log('Using mock data for demonstration');
        return [
            ['Header'],  // Header row
            ['10', '4', '', '', '1'],  // Player count, Correct answers, empty, empty, Win (1)
            ['8', '3', '', '', '0'],   // Player count, Correct answers, empty, empty, Loss (0)
            ['12', '5', '', '', '1'],  // Player count, Correct answers, empty, empty, Win (1)
            ['6', '2', '', '', '0'],   // Player count, Correct answers, empty, empty, Loss (0)
            ['15', '4', '', '', '1']   // Player count, Correct answers, empty, empty, Win (1)
        ];
    }

    renderDashboard(gameId, data, columns) {
        console.log(`Rendering dashboard for ${gameId} with data:`, data);
        const dashboardElement = document.getElementById(`dashboard-${gameId}`);
        const contentDiv = dashboardElement.querySelector('.dashboard-content');
        
        if (!data || data.length < 1) {
            console.log(`No data available for ${gameId}`);
            this.showError(gameId, 'No data available');
            return;
        }

        // Process data (skip header row for most, but guess-timeline starts from row 7)
        const dataToProcess = gameId === 'guess-timeline' ? data : data.slice(1);
        console.log(`Processing data for ${gameId}:`, dataToProcess);
        
        const processedData = this.processGameData(gameId, dataToProcess);
        console.log(`Processed data for ${gameId}:`, processedData);
        
        // Create dashboard HTML
        const dashboardHTML = this.createDashboardHTML(gameId, processedData);
        contentDiv.innerHTML = dashboardHTML;
    }

    processGameData(gameId, rawData) {
        const stats = {
            totalPlayers: 0,
            averageScore: 0,
            topScore: 0,
            completionRate: 0,
            chartData: [],
            donutData: null
        };

        switch (gameId) {
            case 'human-vs-ai':
                stats.totalPlayers = rawData.length;
                // Column B (index 1) has Results, Column D (index 3) has Rate
                const rates = rawData.map(row => parseFloat(row[3]) || 0);
                stats.averageScore = rates.reduce((a, b) => a + b, 0) / rates.length;
                stats.topScore = Math.max(...rates);
                // Count wins/losses based on Results column
                const humanWins = rawData.filter(row => row[1] === 'Human' || row[1] === 'Win').length;
                const aiWins = rawData.filter(row => row[1] === 'AI' || row[1] === 'Lose').length;
                stats.humanWins = humanWins;
                stats.aiWins = aiWins;
                stats.donutData = [
                    { label: 'Human Wins', value: humanWins, color: '#28ca42' },
                    { label: 'AI Wins', value: aiWins, color: '#ff5f57' }
                ];
                break;
                
            case 'fake-or-real':
                stats.totalPlayers = rawData.length;
                // Column F (index 5) has Wins, Column G (index 6) has Losses
                const wins = rawData.filter(row => parseInt(row[5]) > 0).length;
                const losses = rawData.filter(row => parseInt(row[6]) > 0).length;
                stats.donutData = [
                    { label: 'Wins', value: wins, color: '#28ca42' },
                    { label: 'Losses', value: losses, color: '#ff5f57' }
                ];
                // Column C (index 2) has Correct scores
                const correctScores = rawData.map(row => parseInt(row[2]) || 0);
                stats.averageScore = correctScores.reduce((a, b) => a + b, 0) / correctScores.length;
                break;
                
            case 'cybertrace':
                // Column C (index 2) has Correct (True/False)
                const trueCount = rawData.filter(row => row[2] === 'True' || row[2] === 'TRUE' || row[2] === 'true').length;
                const falseCount = rawData.filter(row => row[2] === 'False' || row[2] === 'FALSE' || row[2] === 'false').length;
                stats.donutData = [
                    { label: 'Correct', value: trueCount, color: '#28ca42' },
                    { label: 'Incorrect', value: falseCount, color: '#ff5f57' }
                ];
                stats.totalPlayers = rawData.length;
                break;
                
            case 'countdown':
                stats.totalPlayers = rawData.length;
                // Column D (index 3) has Result (Win/Lose)
                const winCount = rawData.filter(row => row[3] === 'Win' || row[3] === 'WIN' || row[3] === 'win').length;
                const loseCount = rawData.filter(row => row[3] === 'Lose' || row[3] === 'LOSE' || row[3] === 'lose').length;
                stats.donutData = [
                    { label: 'Wins', value: winCount, color: '#28ca42' },
                    { label: 'Losses', value: loseCount, color: '#ff5f57' }
                ];
                break;
                
            case 'guess-timeline':
                stats.totalPlayers = rawData.length;
                // Column H (index 7) has Accuracy %
                const accuracies = rawData.map(row => parseFloat(row[7]) || 0);
                stats.averageScore = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
                stats.topScore = Math.max(...accuracies);
                stats.chartData = rawData.slice(-7).map(row => ({
                    value: parseFloat(row[7]) || 0,
                    height: Math.max(10, ((parseFloat(row[7]) || 0) / 100) * 40)
                }));
                break;
        }

        return stats;
    }

    getChartValue(gameId, row) {
        switch (gameId) {
            case 'human-vs-ai':
                return parseInt(row[1]) || 0; // Score
            case 'fake-or-real':
                const correct = parseInt(row[1]) || 0;
                const total = parseInt(row[2]) || 1;
                return (correct / total) * 100;
            case 'cybertrace':
                return parseInt(row[1]) || 0; // Level
            case 'countdown':
                return parseInt(row[1]) || 0; // Time remaining
            case 'guess-timeline':
                const guessed = parseInt(row[2]) || 0;
                const totalEvents = parseInt(row[3]) || 1;
                return (guessed / totalEvents) * 100;
            default:
                return 0;
        }
    }

    createDashboardHTML(gameId, stats) {
        const gameNames = {
            'human-vs-ai': 'Human vs AI',
            'fake-or-real': 'Fake or Real',
            'cybertrace': 'CyberTrace',
            'countdown': 'Countdown',
            'guess-timeline': 'Timeline'
        };

        const config = DASHBOARD_CONFIG[gameId];
        
        if (config.chartType === 'donut' && stats.donutData) {
            return this.createDonutDashboard(gameId, stats);
        } else {
            return this.createBarDashboard(gameId, stats);
        }
    }

    createDonutDashboard(gameId, stats) {
        const gameNames = {
            'human-vs-ai': 'Human vs AI',
            'fake-or-real': 'Fake or Real',
            'cybertrace': 'CyberTrace',
            'countdown': 'Countdown'
        };

        const donutChart = this.createDonutChart(stats.donutData);
        
        let specificStats = '';
        
        switch (gameId) {
            case 'human-vs-ai':
                const totalGames = (stats.humanWins || 0) + (stats.aiWins || 0);
                const winRate = totalGames > 0 ? Math.round((stats.humanWins / totalGames) * 100) : 0;
                specificStats = `
                    <div class="stat-row">
                        <span class="stat-label">Human Win Rate:</span>
                        <span class="stat-value">${winRate}%</span>
                    </div>
                `;
                break;
            case 'fake-or-real':
                specificStats = `
                    <div class="stat-row">
                        <span class="stat-label">Avg Score:</span>
                        <span class="stat-value">${Math.round(stats.averageScore)}/5</span>
                    </div>
                `;
                break;
            case 'cybertrace':
                const correctRate = stats.donutData[0] ? Math.round((stats.donutData[0].value / stats.totalPlayers) * 100) : 0;
                specificStats = `
                    <div class="stat-row">
                        <span class="stat-label">Accuracy:</span>
                        <span class="stat-value">${correctRate}%</span>
                    </div>
                `;
                break;
            case 'countdown':
                const winRateCountdown = stats.donutData[0] ? Math.round((stats.donutData[0].value / (stats.donutData[0].value + stats.donutData[1].value)) * 100) : 0;
                specificStats = `
                    <div class="stat-row">
                        <span class="stat-label">Win Rate:</span>
                        <span class="stat-value">${winRateCountdown}%</span>
                    </div>
                `;
                break;
        }

        return `
            <div class="dashboard-header">${gameNames[gameId]}</div>
            <div class="dashboard-stats">
                <div class="stat-row">
                    <span class="stat-label">Players:</span>
                    <span class="stat-value">${stats.totalPlayers}</span>
                </div>
                ${specificStats}
            </div>
            ${donutChart}
        `;
    }

    createBarDashboard(gameId, stats) {
        const gameNames = {
            'guess-timeline': 'Timeline'
        };

        let specificStats = '';
        
        switch (gameId) {
            case 'guess-timeline':
                specificStats = `
                    <div class="stat-row">
                        <span class="stat-label">Avg Accuracy:</span>
                        <span class="stat-value">${Math.round(stats.averageScore)}%</span>
                    </div>
                `;
                break;
        }

        const chartBars = stats.chartData.map(point => 
            `<div class="chart-bar" style="height: ${point.height}px;" title="${point.value}"></div>`
        ).join('');

        return `
            <div class="dashboard-header">${gameNames[gameId]}</div>
            <div class="dashboard-stats">
                <div class="stat-row">
                    <span class="stat-label">Players:</span>
                    <span class="stat-value">${stats.totalPlayers}</span>
                </div>
                ${specificStats}
            </div>
            <div class="dashboard-chart">
                ${chartBars}
            </div>
        `;
    }

    createDonutChart(data) {
        if (!data || data.length === 0) return '';
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return '<div class="error-message">No data</div>';
        
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        let currentAngle = 0;
        
        const segments = data.map(item => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -currentAngle * (circumference / 100);
            currentAngle += percentage;
            
            return `<circle class="donut-segment" cx="40" cy="40" r="${radius}" 
                     stroke="${item.color}" stroke-dasharray="${strokeDasharray}" 
                     stroke-dashoffset="${strokeDashoffset}" title="${item.label}: ${item.value}"></circle>`;
        }).join('');
        
        const legend = data.map(item => 
            `<div class="legend-item">
                <div class="legend-color" style="background-color: ${item.color}"></div>
                <span>${item.label}: ${item.value}</span>
            </div>`
        ).join('');
        
        const centerText = `${Math.round((data[0].value / total) * 100)}%`;
        
        return `
            <div class="donut-chart">
                <svg viewBox="0 0 80 80">
                    ${segments}
                </svg>
                <div class="donut-center">${centerText}</div>
            </div>
            <div class="donut-legend">
                ${legend}
            </div>
        `;
    }

    calculateAverage(data, columnIndex) {
        const values = data.map(row => parseFloat(row[columnIndex]) || 0);
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    getMaxValue(data, columnIndex) {
        const values = data.map(row => parseFloat(row[columnIndex]) || 0);
        return Math.max(...values);
    }

    showLoading(gameId) {
        const dashboardElement = document.getElementById(`dashboard-${gameId}`);
        const contentDiv = dashboardElement.querySelector('.dashboard-content');
        contentDiv.innerHTML = '<div class="loading">Loading...</div>';
    }

    showError(gameId, message) {
        const dashboardElement = document.getElementById(`dashboard-${gameId}`);
        const contentDiv = dashboardElement.querySelector('.dashboard-content');
        contentDiv.innerHTML = `<div class="error-message">${message}</div>`;
    }

    // Method to refresh a specific dashboard
    async refreshDashboard(gameId) {
        await this.loadGameDashboard(gameId);
    }

    // Method to refresh all dashboards
    async refreshAllDashboards() {
        await this.loadAllDashboards();
    }
}

// Initialize dashboard when page loads
const gameDashboard = new GameDashboard();

// Auto-refresh dashboards every 5 minutes
setInterval(() => {
    gameDashboard.refreshAllDashboards();
}, 300000);

// Export for external use
window.GameDashboard = GameDashboard;
