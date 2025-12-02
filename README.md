# StockDashboard

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

# Setup Instructions

## Prerequisites
- Node.js 18.19+ or 20.11+
- npm
- Alpha Vantage API key - [Get one here](https://www.alphavantage.co/support/#api-key)

## Installation

1. **Clone the repository**
```bash
   git clone https://github.com/bjackson14/stock-dashboard.git
   cd stock-dashboard
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure API Key**
   
   Copy the environment template files:
```bash
   cp src/environments/environment.development.template.ts src/environments/environment.development.ts
   cp src/environments/environment.production.template.ts src/environments/environment.production.ts
```
   
   Open `src/environments/environment.development.ts` and replace `'REPLACE_WITH_YOUR_API_KEY'` with your actual Alpha Vantage API key.
   
   Open `src/environments/environment.production.ts` and replace `'REPLACE_WITH_YOUR_API_KEY'` with your actual Alpha Vantage API key.

4. **Run the application**
```bash
   ng serve
```
   
   Navigate to `http://localhost:4200` in your browser.

## About the API Key

This project uses the Alpha Vantage API to get stock market data. A free API key provides 25 requests per day.