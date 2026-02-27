const { optimize } = require("./services/scheduleOptimizeService");

function highlight(str) {
  return `\x1b[36m${str}\x1b[0m`;
}

function runScenario(name, weights) {
  console.log(`\n=================================================`);
  console.log(highlight(`SCENARIO: ${name}`));
  console.log(`Weights: Throughput=${weights.throughputWeight}, Risk=${weights.downtimeWeight}, Maint=${weights.maintenanceWeight}`);
  console.log(`=================================================`);
  
  const result = optimize(weights);
  const kpis = result.kpis;
  
  console.log(`\n--- KPIs ---`);
  console.log(`Score (Net Value): ₹${kpis.net_value.toLocaleString('en-IN')}`);
  console.log(`Revenue:           ₹${kpis.total_revenue.toLocaleString('en-IN')}`);
  console.log(`Risk Exposure:     ₹${kpis.total_downtime_risk_cost.toLocaleString('en-IN')}`);
  console.log(`Maintenance Cost:  ₹${kpis.total_maintenance_cost.toLocaleString('en-IN')}`);
  
  console.log(`\n--- SCHEDULED JOBS (${result.schedule.length}/${result.schedule.length + result.deferred_jobs.length}) ---`);
  result.schedule.forEach(j => {
    const maintStr = j.maintenance_window ? ` [AUTO-MAINT: ₹${j.maintenance_window.cost}]` : "";
    console.log(`- ${j.job_id} -> ${j.machine_id} (Rev: ₹${j.revenue}, Risk: ${(j.failure_probability*100).toFixed(0)}%)${maintStr}`);
  });
  
  if (result.deferred_jobs.length > 0) {
    console.log(`\n--- DEFERRED JOBS (${result.deferred_jobs.length}) ---`);
    result.deferred_jobs.forEach(d => {
      console.log(`- ${d.job_id}: ${d.reason}`);
    });
  }
}

// Scenario 1: High Throughput (Ignore risk/maintenance)
runScenario("MAXIMUM THROUGHPUT", {
  throughputWeight: 1.0,
  downtimeWeight: 0.0,
  maintenanceWeight: 0.0
});

// Scenario 2: High Risk Avoidance 
runScenario("MAXIMUM RISK AVOIDANCE", {
  throughputWeight: 0.2, // Need some revenue to justify scheduling at all
  downtimeWeight: 1.0,
  maintenanceWeight: 0.1
});

// Scenario 3: High Maintenance Cost Avoidance
runScenario("MINIMIZE MAINTENANCE COSTS", {
  throughputWeight: 0.5,
  downtimeWeight: 0.1,
  maintenanceWeight: 1.0
});
