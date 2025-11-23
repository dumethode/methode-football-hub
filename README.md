# Methode's Football Hub

Football Match Intelligence Platform  
A distributed web application that transforms football data into structured insights. Built for sports journalists and stakers who need real-time data, statistical analysis, and predictive modeling.

## Practical Purpose and Value
- For stakers, the AI Prediction Engine provides winning probabilities using team form, goal difference, and home advantage.  
- For journalists, server-side caching ensures fast access to league statistics during high traffic periods.

## Key Features
- AI Prediction Engine that simulates match outcomes using historical data.  
- High performance caching with a server-side TTL of 60 seconds.  
- Dynamic theming that adapts to the selected league.  
- Interactive standings with league filters and form guides.

## Technical Architecture

The application uses a three tier distributed architecture.

1. Load Balancer (LB-01)  
   Software: HAProxy  
   Role: Distributes traffic using a round robin algorithm.

2. Web Servers (Web-01 and Web-02)  
   Runtime: Node.js v18 managed with PM2  
   Reverse Proxy: Nginx forwards traffic to port 3000

3. Security and Error Handling  
   API keys stored securely in the .env file  
   Error handling for API failures such as limits and timeouts

## Installation and Setup

### Local Development

git clone https://github.com/dumethode/methode-football-hub.git  
cd methode-football-hub  
npm install  
echo "FOOTBALL_API_KEY=your_api_key" > .env  
echo "PORT=3000" >> .env  
npm start

### Deployment Configuration  
Servers run on Ubuntu 20.04

### Nginx Reverse Proxy

server {  
    listen 80 default_server;  
    location / {  
        proxy_pass http://localhost:3000;  
        proxy_http_version 1.1;  
        proxy_set_header Upgrade \$http_upgrade;  
        proxy_set_header Connection 'upgrade';  
        proxy_set_header Host \$host;  
        proxy_cache_bypass \$http_upgrade;  
    }  
}

### HAProxy Load Balancer

backend football-backend  
    balance roundrobin  
    server web-01 18.206.255.103:80 check  
    server web-02 18.233.156.110:80 check

## Credits and Attribution

### External API  
Football-Data.org for live scores, fixtures, and statistics.

### Libraries and Resources  
Node-Cache for caching  
Google Fonts, Montserrat  
FontAwesome icons

## Author  
Methode Dumez  
GitHub: @dumethode  
Email: duhujubumwe@icloud.com  
Instagram: @dumethode  

Submitted for Web Development Assignment 2025
