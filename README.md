# Zyra: AI-Driven Risk-Aware Production Scheduling

![React](https://img.shields.io/badge/React-18.x-blue) 
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![FastAPI](https://img.shields.io/badge/FastAPI-ML_Service-teal)
![Gemini](https://img.shields.io/badge/Google_AI_Studio-Gemini_2.0-orange)

Zyra is an enterprise-grade AI Manufacturing ERP designed to tackle complex multi-objective scheduling problems. It bridges the gap between **Machine Learning failure predictions** and **Mathematical constraints mapping** to create optimized, real-time job allocation rosters.

> **Note:** For a deep dive into the AI models and optimization math, please read [HOW_IT_WORKS.md](./HOW_IT_WORKS.md).

## 🚀 Architecture Overview

This project consists of 3 completely decoupled microservices:

### 1. The ML Risk Microservice (`/zyra-ml`)
Built on Python & FastAPI. We simulate manufacturing telemetry and train a `RandomForestClassifier` to map operating hours, temperature, and vibration onto dynamic **Failure Probabilities** (0-100%).

### 2. The Operations Backend Engine (`/zyra-server`)
Built on Node.js / Express. The core computation hub.
- **Scheduling Optimization Engine**: A greedy composite scoring algorithm that balances Throughput vs Risk vs Maintenance.
- **AI Explainability Service**: Integrates **Gemini 2.0 Flash** to parse algorithmic scheduling decisions and output human-readable JSON insights.

### 3. AI Command Center Dashboard (`/zyra-client`)
Built on React + Tailwind CSS + Recharts. 
- Real-time Optimization Sliders to control engine weights via Axios.
- Tradeoff Dynamics history line charts.
- Machine Failure Probability Heatmaps and statistical breakdowns.
- *Algorithmic Trace Explanations*: Click "Explain" on any job to reveal the exact mathematical reasoning behind its assignment.

---

## 🏃‍♂️ Quick Start Guide

You do **not** need MongoDB to run the Core AI Scheduling Engine for hackathon demonstrations. The engine uses static memory datasets for instantaneous visualization.

### Option 1: One-Click Start (Windows)
Simply double-click `start_hackathon.bat` in the root folder. It will launch 3 terminals simultaneously.

### Option 2: Manual Start
If you prefer running services individually:

1. **Start the ML Service:**
   ```bash
   cd zyra-ml
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start the Node.js Backend Engine:**
   ```bash
   cd zyra-server
   npm install
   npm start
   ```

3. **Start the React Frontend:**
   ```bash
   cd zyra-client
   npm install
   npm run dev
   ```

Once all three are running, navigate to `http://localhost:5173` in your browser.

## 💎 Hackathon Highlights

- **Multi-Objective Tradeoffs**: Sliding "Cost Controls" all the way up dynamically forces the algorithm to avoid creating predictive maintenance windows, intentionally taking on raw failure risk to save immediate budget.
- **Glass-box AI Transparency**: Every algorithmic choice guarantees an underlying decision trace, eliminating the "Black Box" problem.
- **Gemini 2.0 Integration**: We enforce strict `application/json` returns to map complex mathematical engine matrices into native, ingestible prose.
