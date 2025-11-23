# ⚽ Methode's Football Hub

**Football Match Intelligence Platform**
A distributed web application that transforms raw football data into actionable intelligence. Designed specifically for **sports journalists** and **stakers** who require real-time data, statistical analysis, and predictive modeling to make informed decisions.

[![Demo Video](https://img.shields.io/badge/📺%20Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/X--vJEYpgfE)
[![Status](https://img.shields.io/badge/Status-Deployed-success?style=for-the-badge)](http://www.dumethode.tech)

---

## 🎯 Practical Purpose & Value
* **For Stakers:** The **AI Prediction Engine** calculates winning probabilities based on weighted metrics (Form, Goal Difference, Home Advantage), removing emotional bias from betting decisions.
* **For Journalists:** **Server-Side Caching** ensures instant access to league statistics even during high-traffic API periods, bypassing standard rate limits.

## 🌟 Key Features (User Interaction)
* **🔮 AI Prediction Engine:** Users can select any two teams from supported leagues to simulate a match outcome based on historical data.
* **⚡ High-Performance Caching:** Implemented server-side caching (TTL 60s) to reduce load times and handle API rate limits gracefully.
* **🎨 Dynamic Theming:** Context-aware UI that adapts visual themes based on the selected league (e.g., Liverpool Red for Premier League, Real Madrid Gold for La Liga).
* **📊 Interactive Standings:** Users can filter standings by league and view detailed form guides.

---

## 🛠️ Technical Architecture

The application utilizes a **3-Tier Distributed Architecture** for high availability:

![Architecture Diagram](public/images/architecture.png)

1.  **Load Balancer (LB-01):**
    * **Software:** HAProxy
    * **Role:** Distributes incoming traffic using a **Round-Robin** algorithm to ensure no single server is overwhelmed.
2.  **Web Servers (Web-01 & Web-02):**
    * **Runtime:** Node.js (v18) managed by **PM2** for process resilience.
    * **Reverse Proxy:** **Nginx** handles HTTP requests and forwards them to the application port (3000).
3.  **Security & Error Handling:**
    * **API Security:** API keys are stored in environment variables (`.env`) and never exposed in the codebase.
    * **Graceful Failures:** The app catches API errors (timeouts, limits) and displays user-friendly error messages instead of crashing.

---

## 🚀 Installation & Setup

### 1. Local Development
```bash
# Clone the repository
git clone [https://github.com/dumethode/methode-football-hub.git](https://github.com/dumethode/methode-football-hub.git)
cd methode-football-hub

# Install Dependencies
npm install

# Security Configuration
# Create a .env file to securely store credentials
echo "FOOTBALL_API_KEY=your_api_key" > .env
echo "PORT=3000" >> .env

# Start the Application
npm start
```

### 2. Deployment Configuration
The project is deployed on Ubuntu 20.04 servers.

**Nginx Configuration (Reverse Proxy):**
```nginx
server {
    listen 80 default_server;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**HAProxy Configuration (Load Balancer):**
```haproxy
backend football-backend
    balance roundrobin
    server web-01 18.206.255.103:80 check
    server web-02 18.233.156.110:80 check
```

---

## 📢 Credits & Attribution

This project strictly adheres to attribution requirements for external resources:

### 1. External API
* **[Football-Data.org](https://www.football-data.org/):**
    * Used for fetching live scores, fixtures, and team statistics.
    * *Attribution:* Clearly cited in the application footer and this documentation.

### 2. Libraries & Resources
* **Node-Cache:** Used for implementing the caching layer to optimize performance.
* **Google Fonts:** [Montserrat](https://fonts.google.com/specimen/Montserrat) typeface.
* **FontAwesome:** Used for UI icons.

## 👤 Author

**Methode Dumez**
* **GitHub:** [@dumethode](https://github.com/dumethode)
* **Email:** duhujubumwe@icloud.com
* **Instagram:** [@dumethode](https://instagram.com/dumethode)

---
*Submitted for Web Development Assignment - 2025*
