# ValliGuard AI — Real-Time Fraud Detection Frontend

<div align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Webpack-5.0-8DD6F9?style=for-the-badge&logo=webpack" alt="Webpack"/>
  <img src="https://img.shields.io/badge/Axios-1.6+-5A29E4?style=for-the-badge&logo=axios" alt="Axios"/>
</div>

## 🚀 Overview

ValliGuard AI is a cutting-edge real-time financial transaction fraud detection system that combines machine learning with an intuitive, explainable user interface. The React-based frontend provides an interactive dashboard for analyzing transaction risks with sub-second response times and comprehensive explainability features.

### ✨ Key Features

- **🛡️ Real-Time Analysis**: Sub-500ms fraud detection with live pipeline visualization
- **🧠 Explainable AI**: Feature impact analysis and dynamic risk factor explanations
- **📊 Interactive Dashboard**: Color-coded risk scoring with confidence metrics
- **⚡ High Performance**: Optimized for enterprise-scale transaction processing
- **🎨 Cyber Theme**: Glassmorphism dark UI with neon accents
- **📱 Responsive Design**: Mobile-friendly interface for all devices

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ValliGuard AI Frontend                    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Parameter   │  │   Pipeline   │  │   Risk       │       │
│  │    Form      │  │   Panel      │  │   Results    │       │
│  │ (Input)      │  │ (Animated)   │  │   Panel      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Explanation List & Feature Impact           │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼────────────────────────────────────┘
                          │ POST /predict
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (FastAPI + ML Models)                  │
│  Feature Engineering → AI Models → Risk Assessment          │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend Framework** | React | 19.0.0 | UI components & state management |
| **Build Tool** | Webpack | 5.0 | Module bundling & optimization |
| **Styling** | CSS3 | - | Glassmorphism dark theme |
| **HTTP Client** | Axios | 1.6+ | API communication |
| **JavaScript** | ES6+ | - | Modern JavaScript features |
| **Package Manager** | npm | 9+ | Dependency management |

## 📁 Project Structure

```
Frontend/
├── public/
│   ├── index.html          # Main HTML template
│   ├── manifest.json       # PWA manifest
│   └── robots.txt          # Search engine crawling
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ParameterForm.jsx    # Transaction input form
│   │   ├── ParameterForm.css    # Form styling
│   │   ├── PipelinePanel.jsx    # Processing pipeline animation
│   │   ├── PipelinePanel.css    # Pipeline styling
│   │   ├── RiskResultPanel.jsx  # Results display
│   │   ├── RiskResultPanel.css  # Results styling
│   │   ├── ExplanationList.jsx  # AI explanations
│   │   ├── ExplanationList.css  # Explanation styling
│   │   └── FeatureImpact.jsx    # Feature importance
│   │       └── FeatureImpact.css # Impact visualization
│   ├── pages/              # Page components
│   │   ├── RiskAnalyzer.jsx     # Main dashboard page
│   │   └── RiskAnalyzer.css     # Dashboard styling
│   ├── styles/             # Global styles
│   │   └── common.css      # Shared CSS variables
│   ├── services/           # API services
│   │   └── api.js          # Axios configuration
│   ├── App.js              # Main app component
│   ├── App.css             # App-level styling
│   ├── index.js            # React entry point
│   ├── index.css           # Global styles
│   └── reportWebVitals.js  # Performance monitoring
├── webpack.config.js       # Webpack configuration
├── babel.config.js         # Babel presets
├── postcss.config.js       # PostCSS configuration
├── package.json            # Dependencies & scripts
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Backend API** running at `http://localhost:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratikshahonmane/valliGuard_AI.git
   cd valliGuard_AI/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app will automatically reload on code changes

## 📖 Usage Guide

### Transaction Analysis Workflow

1. **Input Parameters**
   - Enter transaction details in the parameter form
   - Required: Step (hour), Amount, Sender Old Balance
   - Optional: Additional balance fields and transaction type

2. **Submit Analysis**
   - Click the "Submit" button to initiate analysis
   - Watch the animated processing pipeline

3. **Review Results**
   - View risk score (0-100%) with color coding
   - Read AI-generated explanations
   - Analyze feature impact visualization

### Risk Score Interpretation

| Risk Level | Score Range | Color | Action |
|------------|-------------|-------|--------|
| **Low Risk** | 0-30% | 🟢 Green | Approve |
| **Medium Risk** | 30-70% | 🟠 Orange | Flag for Review |
| **High Risk** | 70-100% | 🔴 Red | Block Transaction |

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 3000 |
| `npm run build` | Create production build in `dist/` folder |
| `npm run build:dev` | Create development build with source maps |
| `npm run build:analyze` | Build and open bundle size analyzer |
| `npm run preview` | Serve production build locally |
| `npm test` | Run test suite |
| `npm run eject` | Eject from Create React App (irreversible) |

## 🌐 API Integration

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Analyze single transaction |
| `POST` | `/predict/batch` | Analyze multiple transactions |
| `GET` | `/health` | Check API status |
| `GET` | `/model/info` | Get model metadata |

### Request Format

```json
{
  "step": 1,
  "type": "TRANSFER",
  "amount": 1000.00,
  "oldbalanceOrg": 1500.00,
  "newbalanceOrig": 500.00,
  "oldbalanceDest": 0.00,
  "newbalanceDest": 1000.00
}
```

### Response Format

```json
{
  "prediction": "fraud|legitimate",
  "confidence": 0.96,
  "fraud_probability": 0.87,
  "risk_level": "HIGH",
  "explanation": [
    "High transaction amount detected",
    "Unusual balance change observed",
    "Pattern matches fraud behavior"
  ]
}
```

## 🎨 UI Components

### Core Components

#### ParameterForm
- Transaction input form with validation
- Real-time field validation
- Responsive design for all screen sizes

#### PipelinePanel
- 5-stage animated processing pipeline
- Visual feedback during analysis
- Status indicators for each stage

#### RiskResultPanel
- Risk score visualization
- Color-coded risk levels
- Confidence meter and prediction display

#### ExplanationList
- Dynamic risk factor explanations
- AI reasoning display
- Expandable explanation sections

#### FeatureImpact
- Feature importance visualization
- Impact percentage bars
- Top contributing factors highlighting

## 🔒 Security Features

- **Input Validation**: Client-side and server-side validation
- **HTTPS Only**: Secure communication with backend
- **CORS Protection**: Configured for allowed origins
- **Data Sanitization**: XSS protection and input cleaning

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop Enhancement**: Full feature set on larger screens
- **Touch-Friendly**: Optimized for touch interactions

## 🚀 Production Deployment

### Build Process

```bash
# Create optimized production build
npm run build

# The build artifacts will be stored in the `dist/` directory
```

### Deployment Options

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: AWS CloudFront, Cloudflare
- **Docker**: Containerized deployment
- **Server**: Express.js, Nginx

### Environment Variables

Create `.env` files for different environments:

```bash
# .env.production
REACT_APP_API_BASE_URL=https://api.valliguard.ai
REACT_APP_ENVIRONMENT=production

# .env.development
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📊 Performance

- **Bundle Size**: < 200KB gzipped
- **First Paint**: < 1.5 seconds
- **Time to Interactive**: < 2 seconds
- **Lighthouse Score**: 95+ (Performance, Accessibility, SEO)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.


## 🙏 Acknowledgments

- React Team for the amazing framework
- FastAPI for the robust backend
- The open-source community for inspiration

---

<div align="center">
  <p><strong>ValliGuard AI</strong> - Protecting the financial future with intelligent fraud detection</p>
  <p>Made with ❤️ by the ValliGuard Team</p>
</div>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

