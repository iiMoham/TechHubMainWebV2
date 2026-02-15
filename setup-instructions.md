# Google Sheets Dashboard Setup Instructions

## Overview
Your Tech Hub website now includes interactive dashboards that pull data from Google Sheets for each of the 5 games. Each dashboard displays real-time statistics, charts, and game-specific metrics.

## Setup Steps

### 1. Get Google Sheets API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Copy your API key

### 2. Create Google Sheets for Each Game
Create separate Google Sheets for each game with the following structures:

#### Human VS AI Sheet
- **Columns**: Player, Score, AI_Score, Result
- **Example data**:
  ```
  Player    | Score | AI_Score | Result
  Alice     | 95    | 87       | Human
  Bob       | 78    | 92       | AI
  ```

#### Fake OR Real Sheet
- **Columns**: Player, Correct_Answers, Total_Questions
- **Example data**:
  ```
  Player    | Correct_Answers | Total_Questions
  Alice     | 8               | 10
  Bob       | 6               | 10
  ```

#### CyberTrace Sheet
- **Columns**: Player, Level, Time, Clues_Used, Success
- **Example data**:
  ```
  Player    | Level | Time | Clues_Used | Success
  Alice     | 5     | 120  | 3          | Success
  Bob       | 3     | 180  | 5          | Failed
  ```

#### Countdown Sheet
- **Columns**: Player, Time_Remaining, Completed
- **Example data**:
  ```
  Player    | Time_Remaining | Completed
  Alice     | 45             | Complete
  Bob       | 0              | Failed
  ```

#### Guess The Timeline Sheet
- **Columns**: Player, Accuracy, Events_Guessed, Total_Events
- **Example data**:
  ```
  Player    | Accuracy | Events_Guessed | Total_Events
  Alice     | 85       | 17             | 20
  Bob       | 70       | 14             | 20
  ```

### 3. Configure the Dashboard
1. Open `dashboard.js`
2. Replace `YOUR_GOOGLE_SHEETS_API_KEY` with your actual API key
3. Replace each `YOUR_[GAME]_SHEET_ID` with the actual Google Sheet IDs

#### How to get Sheet ID:
- Open your Google Sheet
- Look at the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- Copy the SHEET_ID part

### 4. Make Sheets Public (Option 1 - Simpler)
1. Open each Google Sheet
2. Click "Share" → "Change to anyone with the link"
3. Set permission to "Viewer"

### 5. Use Service Account (Option 2 - More Secure)
1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Share your sheets with the service account email
4. Modify the dashboard.js to use service account authentication

## Dashboard Features

### Each dashboard displays:
- **Total Players**: Number of participants
- **Game-specific metrics**: 
  - Human vs AI: Win rates for humans vs AI
  - Fake or Real: Average accuracy and best scores
  - CyberTrace: Average level and success rate
  - Countdown: Completion rate and average time
  - Guess Timeline: Accuracy percentages
- **Trend Chart**: Visual representation of recent performance
- **Auto-refresh**: Updates every 5 minutes

### Dashboard Functions Available:
```javascript
// Refresh specific game dashboard
gameDashboard.refreshDashboard('human-vs-ai');

// Refresh all dashboards
gameDashboard.refreshAllDashboards();
```

## Troubleshooting

### Common Issues:
1. **"API key required"** - Add your Google Sheets API key
2. **"Sheet not accessible"** - Make sure sheets are shared properly
3. **"No data available"** - Check if your sheet has data and correct column structure
4. **Charts not showing** - Ensure numeric data in appropriate columns

### Testing:
The dashboard currently shows mock data for demonstration. Once you configure your API key and sheet IDs, it will display real data from your Google Sheets.

## Security Notes:
- Keep your API key secure
- Consider using environment variables for production
- Regularly rotate your API keys
- Use service accounts for better security in production environments
