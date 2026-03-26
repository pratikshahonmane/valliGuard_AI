# ValliGuard AI — Frontend

Real-time financial transaction fraud detection interface powered by machine learning. This React application provides an interactive risk analysis dashboard that communicates with the ValliGuard backend API to classify transactions as fraudulent or legitimate.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Audit      │  │  Processing  │  │   Verdict    │  │
│  │  Parameters   │  │   Pipeline   │  │   Display    │  │
│  │  (Form Input) │  │  (Animated)  │  │  (Risk %)    │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
│         │                                               │
│         ▼                                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Service Layer (Axios)            │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │ POST /predict
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI + scikit-learn)            │
│  Feature Engineering → StandardScaler → Model Inference │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer       | Technology                               |
|-------------|------------------------------------------|
| UI          | React 19, CSS (glassmorphism dark theme) |
| Charts      | Recharts (Pie, Bar)                      |
| HTTP Client | Axios                                    |
| Icons       | Lucide React                             |
| Build       | Webpack 5, Babel                         |
| CSS Tooling | PostCSS, Autoprefixer                    |

## Project Structure

```
Frontend/
├── public/
│   └── index.html               # HTML shell
├── src/
│   ├── index.js                 # App entry point (React root)
│   ├── index.css                # Global styles (light theme base)
│   ├── App.js                   # Main RiskAnalyzer component
│   ├── App.css                  # Dark cyber theme (glass cards, neon inputs)
│   ├── reportWebVitals.js       # Core Web Vitals reporting
│   ├── components/
│   │   ├── Form.js              # Transaction input form
│   │   ├── Result.js            # Prediction result display
│   │   ├── Dashboard.js         # Stats overview (total, fraud count, rate)
│   │   └── Charts.js            # Fraud vs Legit pie chart, risk bar chart
│   └── services/
│       └── api.js               # Axios instance (baseURL → backend)
├── webpack.config.js            # Webpack dev + production config
├── babel.config.js              # Babel presets (env + React automatic JSX)
├── postcss.config.js            # PostCSS with Autoprefixer
└── package.json
```

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Backend API** running at `http://localhost:8000` (see [Backend README](../Backend/README.md))

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (port 3000, hot reload)
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000). The dev server proxies `/predict` and `/api` requests to the backend at `localhost:8000`.

## Available Scripts

| Command               | Description                                                      |
|-----------------------|------------------------------------------------------------------|
| `npm start`           | Start dev server with React Fast Refresh on port 3000            |
| `npm run build`       | Production build to `dist/` (minified, hashed, tree-shaken)     |
| `npm run build:dev`   | Development build to `dist/` (unminified, full source maps)     |
| `npm run build:analyze` | Production build + opens bundle size analyzer in browser       |
| `npm run preview`     | Serve the `dist/` folder locally to preview a production build  |

## How It Works

1. **Input** — The user enters transaction parameters: amount, sender/receiver balances (old and new), and transaction type (TRANSFER or CASH_OUT).

2. **Pipeline Animation** — On submission, the UI animates through the ML pipeline stages: Feature Engineering, StandardScaler Normalization, Model Inference, Logic Validation, and Result Compilation.

3. **API Call** — A POST request is sent to `/predict` with the transaction payload:
   ```json
   {
     "step": 1,
     "type": "TRANSFER",
     "amount": 181.00,
     "oldbalanceOrg": 181.00,
     "newbalanceOrig": 0.00,
     "oldbalanceDest": 0.00,
     "newbalanceDest": 0.00
   }
   ```

4. **Verdict** — The backend returns a fraud probability, risk level, and prediction label. The UI renders a color-coded risk circle:
   - **Green** (< 30%) — Low risk
   - **Orange** (30–70%) — Medium risk
   - **Red** (> 70%) — High/Critical risk

## API Endpoints (Backend)

| Method | Endpoint         | Description                          |
|--------|------------------|--------------------------------------|
| POST   | `/predict`       | Classify a single transaction        |
| POST   | `/predict/batch` | Classify up to 500 transactions      |
| GET    | `/health`        | Check API and model status           |
| GET    | `/model/info`    | Return model metadata and features   |

## Environment Variables

Create `.env`, `.env.development`, or `.env.production` files in the project root. Variables are injected at build time via `webpack.DefinePlugin` and accessible as `process.env.YOUR_VAR` in the app code.

Example `.env`:
```
API_BASE_URL=http://localhost:8000
```

## Production Build

```bash
npm run build
```

The optimized output is written to `dist/`. Key production optimizations:

- **Code splitting** — React, Recharts/D3, and vendor code are split into separate cached chunks
- **Content hashing** — `[contenthash:8]` in filenames enables long-term browser caching
- **CSS extraction** — Styles are extracted to standalone `.css` files
- **JS minification** — Terser with `console.log` and `debugger` removal
- **CSS minification** — CssMinimizerPlugin
- **Tree shaking** — Eliminates unused exports
- **Source maps** — Separate `.map` files (not shipped to end users)
- **Asset inlining** — Images under 10 KB are inlined as data URLs

### Serving the Production Build

```bash
# Using the built-in preview command
npm run preview

# Or with any static file server
npx serve dist

# Or with Python
cd dist && python3 -m http.server 3000
```

## Bundle Analysis

```bash
npm run build:analyze
```

Opens an interactive treemap in the browser showing the size contribution of each module, useful for identifying optimization opportunities.

## Development Notes

- The dev server uses **React Fast Refresh** for instant component-level hot module replacement without losing state.
- The `@` alias maps to `src/`, so you can import as `import Foo from '@/components/Foo'`.
- The dev server error overlay shows compilation errors inline in the browser.
- The backend proxy (`/predict`, `/api`) avoids CORS issues during local development.
