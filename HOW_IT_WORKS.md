# How Zyra AI Works

This document explains the technical architecture, mathematical models, and AI rationale behind the **Zyra Risk-Aware Production Scheduling Platform**.

---

## 🏗 System Architecture

Zyra leverages three completely decoupled microservices:

1. **Python ML Engine (`/zyra-ml`):** A Fast-API service that trains and hosts a `RandomForestClassifier`. It ingests continuous machine telemetry vectors and maps them to dynamic failure probabilities. 
2. **Node.js Core Optimizer (`/zyra-server`):** The central mathematical hub. It hosts the scheduling engine, constraints resolver, and the Gemini 2.0 integration for explainability.
3. **React Dashboard (`/zyra-client`):** A front-end command center utilizing sophisticated `Recharts` visualizations to plot mathematical tradeoffs dynamically via polling the Node endpoint.

---

## 🧠 The Optimization Math (Scheduling Engine)

The core brain of Zyra is not a neural network, but rather a **Greedy Composite Scoring Algorithm**. This deterministic engine is responsible for plotting exactly *which* job goes to *which* machine, and determining if a preventative maintenance window must be injected.

### 1. Variables & Telemetry
- Every Machine ($m$) has a set capacity ($C_m$), an hourly maintenance cost ($M_{c}$), and a live Failure Probability ($fp_m$) polled from the ML Engine.
- Every Job ($j$) has a specific time duration ($D_j$) and a total value/revenue ($R_j$).

### 2. The Objective Function
For every valid `(Job, Machine)` pair that matches type strings, Zyra calculates an optimization Score ($S$):

```
S = (W₁ × Rj) - (W₂ × RiskExposure) - (W₃ × Mc)
```
Where:
* $W_{1,2,3}$ are the normalized weights dictated by the user's Dashboard Sliders.
* `RiskExposure` is calculated as `(fp_m × AverageDowntimeCost × D_j)`. This prices the mathematical risk of assigning this job to an unstable machine.

### 3. Constraint Resolution 
Before a score is assigned, Zyra enforces Manufacturing logic:
- **Type Matching:** A CNC job cannot run on a Welding bay.
- **Capacity Limits:** If a machine only has 4 hours left today, a 5-hour job is immediately rejected.
- **Auto-Maintenance:** If a machine's failure probability exceeds $50\%$, Zyra deducts hours from its capacity and injects an automatic `Maintenance_Window` (costing money, but eliminating risk for subsequent jobs).

### 4. Greedy Assignment Matrix
Once all valid candidate pairs are scored, Zyra sorts the array *Descending by Score*. It then loops through this master list, assigning the highest-scoring pairs first. 

If a job is already assigned, it skips lower-scoring machines for that job.
If all machines a job can run on run out of capacity, it moves that job to the `Deferred_Jobs` array and totals the revenue lost.

---

## 🔍 AI Explainability (Gemini 2.0 Integration)

To make edge-case mathematics digestible by factory operators, we implement a **Glass-box NLP pipeline**:
1. When a user clicks "Explain AI Decision", Zyra bundles the Machine's specific telemetry metrics, its ML Failure Probability, and its `Feature Importance` output (e.g. "Vibration anomaly detected").
2. It sends this to `gemini-2.0-flash`.
3. The Prompt uses **Strict JSON Enforcing** (`responseMimeType: application/json`) to demand structured prose, separating the output into a `plain_language_explanation`, an executive `management_summary`, and an actionable `operator_recommendation`.

---

## 📊 React Visulizations (The Tradeoff Map)

By separating the Weights into three competing metrics (Throughput vs Risk vs Cost), Zyra inherently creates a tradeoff paradox:
* If you **Maximize Throughput**, the engine routes jobs anywhere and everywhere to capture revenue, spiking your Risk metrics.
* If you **Minimize Maintenance Budget**, the engine outright refuses to schedule preventative maintenance. To compensate for not fixing unstable machines, your predictive Risk Exposure curve immediately spikes.

Our Dashboard uses Recharts `LineCharts` to plot a history object every time a user drags a slider. This visualizes this exact mathematical tradeoff, demonstrating the value of constraint programming visually over time!
