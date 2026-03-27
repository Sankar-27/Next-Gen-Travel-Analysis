# TrendAtlas — Next-Gen Travel Intelligence Platform

A dark-themed, AI-powered travel trends analytics SaaS platform that analyzes travel datasets and produces intelligent insights about emerging global tourism behaviors.

## Features

- **7-Step Analysis Pipeline**: Dataset understanding → Cleaning → EDA → Trend Detection → Visualization → Insights → Recommendations
- **Travel Trend Detection**: Set-Jetting, Coolcations, Slow Travel, Wellness Tourism, Agritourism, Multi-Generational Travel, Emerging Destinations
- **AI-Powered Insights**: Claude Sonnet API generates contextual travel intelligence
- **Interactive Charts**: Line, Bar, Doughnut, Scatter, Radar visualizations via Chart.js
- **Dark Analytics Dashboard**: Professional dark-themed interface with animated components
- **3 Sample Datasets**: Search Trends, Climate & Destination, Booking Data

## Quick Start

### Option 1: Open directly in browser
```
open index.html
```
That's it! No build step needed. The app runs fully in the browser.

### Option 2: Local server (recommended for API calls)
```bash
# Python
python -m http.server 8080

# Node.js
npx serve .

# Then open http://localhost:8080
```

## Project Structure

```
travel-trends-platform/
├── index.html                  # Main entry point
├── src/
│   ├── styles.css              # Dark dashboard theme
│   ├── app.js                  # Main controller & pipeline orchestrator
│   ├── data/
│   │   └── samples.js          # 3 sample CSV datasets
│   └── utils/
│       ├── parser.js           # CSV parsing, schema inference, data cleaning
│       ├── analyzer.js         # EDA engine & trend scoring algorithms
│       ├── charts.js           # Chart.js rendering utilities
│       └── ai.js               # Claude API integration
└── README.md
```

## How to Use

1. **Upload a CSV** or click one of the 3 sample dataset cards
2. The platform automatically runs the full 7-step analysis pipeline
3. Navigate sections using the left sidebar:
   - **Dataset Overview**: Schema, cleaning summary, data preview
   - **Exploratory Analysis**: Charts, correlations, seasonality
   - **Trend Detection**: Classified tourism trends with confidence scores
   - **AI Insights**: Claude-generated travel intelligence
   - **Business Recommendations**: Strategic actions by stakeholder type

## Supported Data Types

| Field Type | Examples |
|---|---|
| Location | `destination`, `country`, `region`, `city` |
| Date/Time | `month`, `year`, `date`, `quarter` |
| Volume | `search_volume`, `annual_tourists` |
| Growth | `search_growth_pct`, `year_over_year_growth` |
| Behavior | `travel_type`, `avg_stay_days`, `party_size` |
| Spend | `total_spend_usd`, `avg_daily_rate` |

## Detected Travel Trends

| Trend | Badge | Detection Signals |
|---|---|---|
| 🎬 Set-Jetting | Red | `travel_type=Set-Jetting`, film production counts, known filming locations |
| ❄️ Coolcations | Cyan | `climate_type=Subarctic`, coolness index, Nordic/Patagonia destinations |
| 🐢 Slow Travel | Green | Avg stay > 10 days, `travel_type=Slow Travel` |
| 🧘 Wellness Tourism | Violet | `wellness_score > 75`, Bali/Kerala/Costa Rica destinations |
| 🌾 Agritourism | Amber | `agri_score > 70`, Tuscany/Provence/Oaxaca destinations |
| 👨‍👩‍👧‍👦 Multi-Gen | Pink | Party size ≥ 5, villa/multi-room bookings |
| 🌟 Emerging | Orange | Growth > 40%, Slovenia/Azores/Georgia destinations |

## Claude API Integration

The platform calls `claude-sonnet-4-20250514` for:
- **AI Insights**: Contextual analysis of dataset patterns (Step 6)
- **Business Recommendations**: Stakeholder-specific strategy (Step 7)

If the API is unavailable, the platform falls back to its built-in analytics engine.

## Technologies

- **Vanilla JS** — No framework, runs anywhere
- **Chart.js 4.4** — Interactive visualizations
- **PapaParse 5.4** — Fast CSV parsing
- **Claude API** — AI-powered insights
- **Google Fonts** — Syne (display) + Space Mono (data) + Inter (body)

## Customization

### Add new trend detectors
In `src/utils/analyzer.js`, add a new `_scoreXxx()` method following the pattern of existing detectors, then call it in `detectTrends()`.

### Add new chart types
In `src/utils/charts.js`, add a new `renderXxx()` method using Chart.js, then call it from `buildEDACharts()`.

### Modify sample data
Edit `src/data/samples.js` to add or modify sample CSV datasets.
