<div align="center">
  <h1>
    <img src="./public/logo.png" width="50" align="left" style="margin-right: 15px;" alt="Aahara Setu Logo" /> 
    Aahara Setu
  </h1>
  <p><strong>A Circular Food Redistribution Network designed to permanently eliminate urban food waste.</strong></p>

  <p>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Status-Hackathon_Project-4F633D?style=for-the-badge" alt="Status" /></a>
  </p>
</div>

<br/>

## 🎯 The Mission
Globally, **one-third** of all food produced is wasted while millions go hungry. **Aahara Setu** bridges this gap using real-time urgency mapping, instantly connecting surplus food from high-volume generators (hotels & restaurants) to those in need (NGOs & shelters).

> **For Businesses:** Turn costly food waste into tax write-offs, lower garbage-disposal bills, and powerful marketing PR. <br>
> **For NGOs:** Receive high-quality, hot meals exactly when you need them.

---

## ⚡ How It Works (The Lifecycle)

```mermaid
graph LR
    A[🛒 Donor Uploads Food] -->|Calculates Urgency| B{AI Matching}
    B -->|Exclusive 30 min window| C(Primary NGO Alert)
    C -->|If Unclaimed| D(Auto-Redistribution)
    D -->|Wider Radius| E[Backup NGOs & Volunteers]
    C -->|NGO Claims| F[✅ Claim Confirmed]
    E --> F
    F -->|Location Traced| G[🚚 Pickup Logistics Triggered]
    style A fill:#FFF7E2,stroke:#4F633D,stroke-width:2px,color:#2a3520
    style B fill:#FFF7E2,stroke:#4F633D,stroke-width:2px,color:#2a3520
    style C fill:#FFF7E2,stroke:#4F633D,stroke-width:2px,color:#2a3520
    style F fill:#6cbf5e,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 🧩 Core Features

| Feature | Description |
| :---: | :--- |
| 🧮 **Dynamic Urgency Scoring** | Advanced algorithm scoring each listing (0-100) based on remaining expiry time, food type, distance, and real-time demand. |
| 🔁 **Auto-Redistribution** | A failsafe mechanism! If prioritized NGOs do not claim the food within a set time frame, alerts are broadcasted to backup shelters to guarantee zero waste. |
| 🗺️ **Live Radar Map** | Instant visual integration powered by **Leaflet (OpenStreetMap)** to guide volunteers to the donor's exact doorstep. |
| 🌱 **CO₂ Impact Tracking** | Converts kilograms of food rescued into exact tons of carbon emissions prevented. |
| 👔 **B2B Analytics Dashboards** | Providing businesses with "Donation Ledgers", tax-deduction logs, and trackable ESG score upgrades. |

---

## 💻 Tech Stack Overview

- **Frontend:** React 19, TypeScript, React Router
- **Build Tool:** Vite (Ultra-fast HMR)
- **Styling:** Modular CSS, Glassmorphism UI tokens, Responsive Breakpoints
- **Icons & Maps:** Lucide React, OpenStreetMap Web Intent

---

## 🚀 Getting Started

To run the project locally on your machine and experience the dashboard:

```bash
# 1. Clone the repository
git clone https://github.com/bharathkumar000/Aahara-setu.git

# 2. Navigate to project root
cd aahara-setu

# 3. Install NPM dependencies
npm install

# 4. Spin up the development server
npm run dev
```

Visit the displayed standard localhost port (usually `http://localhost:5173`) in your browser.

---

<br/>
<div align="center">
  <sub>Built with 💚 to zero-out hunger.</sub>
</div>
