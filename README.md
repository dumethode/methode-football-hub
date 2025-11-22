# ⚽ Methode's Football Hub

**Football Match Intelligence Platform** A dynamic web application that aggregates live football scores, statistics, and provides AI-powered match predictions. Built with Node.js and the Football-Data.org API.

![Status](https://img.shields.io/badge/Status-Deployed-success)
![Tech](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20Nginx%20%7C%20HAProxy-blue)

## 🌟 Features

* **Live Match Data:** Real-time (delayed) scores for major leagues (Premier League, La Liga, Bundesliga, etc.).
* **Prediction Engine:** Custom algorithm calculating winning probabilities based on form, goal difference, and home advantage.
* **Team Themes:** Dynamic UI theming for specific teams (Liverpool & Real Madrid).
* **Interactive Standings:** detailed league tables with form guides.
* **Responsive Design:** Fully mobile-compatible UI using Montserrat typography and FIFA color palette.

---

## 🏗️ Architecture

The application follows a 3-tier distributed architecture for high availability:

1.  **Client:** Accesses the application via the Load Balancer.
2.  **Load Balancer (LB-01):** Uses **HAProxy** to distribute traffic using a Round-Robin algorithm.
3.  **Web Servers (Web-01 & Web-02):** Two redundant servers running **Node.js** (via PM2) behind an **Nginx** reverse proxy.

---

## 🚀 1. Local Installation (Development)

To run this project on your local machine:

### Prerequisites
* Node.js (v14 or higher)
* NPM

### Steps
1.  **Clone the repository**
    ```bash
    git clone [https://github.com/dumethode/methode-football-hub.git](https://github.com/dumethode/methode-football-hub.git)
    cd methode-football-hub
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    FOOTBALL_API_KEY=your_api_key_here
    PORT=3000
    ```
    *(Note: API Key provided in submission comments)*

4.  **Run the Server**
    ```bash
    npm start
    ```
    Visit `http://localhost:3000` in your browser.

---

## ☁️ 2. Deployment Strategy

This application is deployed on three Ubuntu servers. Below is the configuration used for the production environment.

### A. Web Servers Configuration (Web-01 & Web-02)
Both web servers are configured identically:
1.  **Process Management:** **PM2** is used to keep the Node.js application running in the background and handle restarts.
    ```bash
    pm2 start server.js --name football-hub
    ```
2.  **Reverse Proxy:** **Nginx** listens on Port 80 and forwards traffic to the Node.js app on Port 3000.
    * *Nginx Config Snippet:*
        ```nginx
        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
        ```

### B. Load Balancer Configuration (LB-01)
The Load Balancer uses **HAProxy** to split traffic evenly between Web-01 and Web-02.

* **Algorithm:** Round Robin
* **HAProxy Config (`/etc/haproxy/haproxy.cfg`):**
    ```haproxy
    backend football-backend
        mode http
        balance roundrobin
        server web-01 18.2............. check
        server web-02 18.2............. check
    ```

---

## 📚 API Reference

This project uses the [Football-Data.org API](https://www.football-data.org/).
* **Free Tier Limits:** 10 requests/minute.
* **Data Scope:** Fixtures, Standings, and Match Results.

## 👤 Author

**Methode Dumez**
* GitHub: [@dumethode](https://github.com/dumethode)
* Email: duhujubumwe@icloud.com

---
*Submitted for Web Development Assignment - 2025*
