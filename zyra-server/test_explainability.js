require("dotenv").config({ path: ".env" });
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { JWT_SECRET } = require("./config/env");

async function testExplainability() {
  const token = jwt.sign({ id: "123", role: "admin" }, JWT_SECRET, { expiresIn: "1h" });

  const payload = {
    machine_metrics: {
      equipment_id: "M01",
      operating_hours: 8500,
      temperature: 92.5,
      vibration: 5.2,
      rpm: 3800
    },
    failure_probability: 0.78,
    feature_importance: {
      temperature: 0.35,
      vibration: 0.25,
      operating_hours: 0.15
    },
    scheduling_decision: "Job J004 (Precision Gear Cutting) was assigned to M01. Auto-maintenance window scheduled immediately after.",
    deferred_jobs: ["J012 (Spot Welding Panel)"],
    adjusted_weights: {
      throughputWeight: 1.0,
      downtimeWeight: 0.2,
      maintenanceWeight: 0.1
    }
  };

  try {
    console.log("Sending request to /api/v1/explainability/decision...");
    const res = await axios.post("http://localhost:5000/api/v1/explainability/decision", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("\nSuccess! Gemini Response:\n");
    console.log(JSON.stringify(res.data.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

testExplainability();
