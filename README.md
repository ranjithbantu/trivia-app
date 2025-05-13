# 🧠 Trivia-App

A full-stack mini-quiz platform built with:

* **MongoDB 7** – questions & scores  
* **Node.js + Express** – REST API (`/api/categories`, `/api/quiz`, `/api/score`)  
* **React + Vite + Redux Toolkit** – front-end SPA  
* **Docker Compose** – one-command spin-up

---

## 🚀 Quick-Start

```bash
git clone https://github.com/ranjithbantu/trivia-app.git
cd trivia-app

# 1) build & start MongoDB, back-end and front-end
docker compose up --build -d

# 2) (one-off) seed the DB with ±20-40 questions per category  ≈ 1 min
docker compose exec backend npm run seed
