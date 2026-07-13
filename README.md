# 📈 Investment Research Assistant

An AI-powered investment research platform that provides comprehensive equity analysis using **Google Gemini AI** and **live market data**. The application helps investors make informed decisions through SWOT analysis, competitor comparison, investment recommendations, and real-time stock information.

---

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based Authentication
- User Registration & Login
- Password Encryption using BCrypt
- Protected REST APIs with Spring Security
- Role-based Authentication
- Global Exception Handling
- Request Validation

### 🤖 AI Investment Analysis
- AI-generated company research using Google Gemini
- SWOT Analysis
- BUY / HOLD / SELL Recommendation
- Investment Score (0–100)
- Risk Level Assessment
- Growth Potential Analysis
- 12-Month Price Target

### 📊 Live Market Data
- Current Stock Price
- 52 Week High / Low
- Volume
- Daily Change %
- Automatic Symbol Resolution
- Yahoo Finance Fallback Support

### 📁 Research History
- Save AI Research
- User-specific Research History
- Pin / Unpin Research
- Watchlist
- Delete Individual Research
- Clear History

### 🎨 Frontend
- React + Vite
- Material UI
- Responsive Dashboard
- Dark / Light Mode
- Modern Authentication Pages

---

# 🛠 Tech Stack

## Backend

- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL
- JWT Authentication
- Google Gemini API

## Frontend

- React
- Vite
- Material UI (MUI)
- Axios

---

# 📂 Project Structure

```
investment-research-assistant
│
├── investment-agent-ui/      # React Frontend
│
├── src/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── security/
│   ├── filter/
│   ├── dto/
│   ├── config/
│   └── exception/
│
└── pom.xml
```

---

# 🔑 APIs

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Register User |
| POST | `/auth/login` | Login & Get JWT |

---

## Investment Research

| Method | Endpoint |
|---------|----------|
| POST | `/api/research` |

Authorization Required

```
Bearer <JWT_TOKEN>
```

Example Request

```json
{
    "company":"Tesla",
    "includeLiveData":true
}
```

---

## Research History

| Method | Endpoint |
|---------|----------|
| GET | `/api/history` |
| GET | `/api/history/recent` |
| GET | `/api/history/watchlist` |
| PATCH | `/api/history/{id}/pin` |
| DELETE | `/api/history/{id}` |
| DELETE | `/api/history/clear` |

---

## Admin

| Method | Endpoint |
|---------|----------|
| GET | `/admin/users` |

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/<your-username>/Investment-Research-Assistant.git
```

Backend

```bash
cd Investment-Research-Assistant
```

Install dependencies

```bash
mvn clean install
```

Run

```bash
mvn spring-boot:run
```

---

Frontend

```bash
cd investment-agent-ui
```

Install packages

```bash
npm install
```

Run

```bash
npm run dev
```

---

# 💻 Screens

- Login Page
- Registration Page
- AI Research Dashboard
- Research History
- Watchlist
- Market Data Panel

---
# 🔌 External APIs Used

| API | Purpose |
|------|---------|
| **Google Gemini API (Gemini 2.5 Flash)** | AI-powered investment research, SWOT analysis, recommendations, and structured JSON responses. |
| **Finnhub API** | Retrieves real-time stock market data, company information, and financial metrics. |
| **Twelve Data API** | Backup (fallback) provider for live stock prices and market data when the primary source is unavailable. |
| **NewsAPI** | Fetches the latest financial and company-related news articles used in investment research. |

---

# 📈 Supported Market

Currently Supported

- 🇺🇸 NYSE
- 🇺🇸 NASDAQ
- 🇮🇳 NSE
- 🇮🇳 BSE

---

# 🚀 Future Enhancements

- Portfolio Management
- Stock News Integration
- PDF Report Export
- Email Reports
- Technical Indicators
- Company Financial Statements
- Stock Charts
- Watchlist Notifications
- Multi-user Roles
- Docker Deployment

---

# 👨‍💻 Developed By

**Komal**

Backend
- Spring Boot
- Spring Security
- JWT
- Hibernate
- MySQL

Frontend
- React
- Material UI
- Vite

AI
- Google Gemini API

---

# 📄 License

This project is developed for learning purposes and portfolio demonstration.
