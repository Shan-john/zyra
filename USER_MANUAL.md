# Zyra Operations Guide: A Manual for Factory Managers

Welcome to Zyra! This guide is written for factory floor managers and operators. It will teach you how to use the Zyra AI Dashboard to generate daily production schedules and handle high-risk machines without needing to know any code or complex math.

---

## 🧭 Navigation Basics

When you launch Zyra, your browser will open to the main console. You have two primary screens on the left-hand menu:
1. **The Executive Dashboard (Home):** A birds-eye view of your factory's health today.
2. **AI Insights (Management Dashboard):** The interactive "Command Center" where you will actually generate your schedules and manipulate production priorities.

---

## ⚙️ How to Generate a Schedule (The AI Insights Page)

Click on **AI Insights** in the sidebar. This is where you tell the AI exactly what matters most to your factory *today*.

### 1. Setting Your Priorities
On the left side of your screen, you will see three "Objective Weights" sliders. You can drag these between `0.0` (ignore completely) and `1.0` (maximum priority):

* 🟢 **Maximize Throughput (W1):** Drag this up if your goal today is to push out as many jobs and make as much money as possible. The AI will try to force jobs into any available machine.
* 🔴 **Minimize Risk (W2):** Drag this up if you want to play it safe. The AI will look at live sensor data and avoid assigning jobs to machines that are showing signs of failure (like high temperatures or strange vibrations).
* 🟠 **Minimize Maintenance (W3):** Drag this up if you want to avoid spending money on preventative maintenance today. The AI will try to route jobs in a way that prevents machines from breaking the "danger threshold" that triggers a costly maintenance shutdown.

### 2. Reading the Projected Outcomes
Every time you move a slider, the system **instantly** recalculates the entire factory schedule.

Look right below the sliders at the **Projected Outcomes** box. You will see arrows (`↑` or `↓`) showing you exactly how much money your slider change just made or lost you.
* **Net Value Score:** This is your "Magic Number." It represents your total Revenue **minus** your Expected Downtime Risk Costs **minus** your Maintenance Costs. Zyra is always trying to make this number as high as possible based on your sliders!

---

## 📊 Understanding Your Charts

On the top right of your screen, you have three visual graphs to help you understand what the AI is seeing:

1. **Tradeoff Dynamics (The Line Chart):** This chart records your history. Every time you move a slider, it plots a new point on the timeline. *Example: If you slide 'Throughput' up, you will likely see the green Throughput line jump up, but the red Risk line might also spike!*
2. **Machine Risk Heatmap:** Every dot is a machine on your floor. If a dot is in the red zone at the top, that machine has a high probability of failing today. Try not to schedule priority jobs there!
3. **Health Score Distribution:** A simple bar chart showing how many of your machines are healthy (Green) versus how many need immediate attention (Red).

---

## 📋 Reviewing the Final Roster

At the bottom right of the screen, you will see the **Optimized Assignment List**. This is your final schedule. It tells you exactly which Job to route to which Machine.

### ⚠️ Priority Alerts: Jobs Deferred
If you see a red box above your schedule, it means **jobs were cancelled or delayed**. Why?
If you set your "Minimize Risk" slider very high, the AI might realize there are zero safe machines left to run a specific job. Instead of risking a breakdown, it will "Defer" the job. The red box tells you exactly how much revenue you lost by deferring those jobs.

### 🤖 How to "Talk to the AI" (The Explain Button)
If you ever wonder *why* the AI assigned "Job A" to "Machine B", or why an important job was Deferred, you don't have to guess!

1. Find the job in the Assignment List or the Deferred list.
2. Click the small blue **Explain** button next to it.
3. A window will pop up. The AI will give you an exact, plain-English summary of *why* it made that choice (e.g., *"Assigned to CNC Machine #2 because it was the last machine with enough hour capacity, even though it had a slightly higher risk"*).
4. Below the summary, you can see the raw "Evaluation Steps" log showing exactly which other machines the AI rejected and why.

---

*That's it! As a factory manager, your entire workflow is: Slide the weights to match today's business goals, check the Tradeoff Charts to ensure you aren't taking on too much risk, and then hand the Final Schedule off to your operators.*
