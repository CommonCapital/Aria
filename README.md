# Aria: Your Proactive AI Companion 💖✨

**Aria** is more than just a voice assistant—she is an AI-powered companion designed to deeply integrate into your life and actually get things done. She doesn't just "answer questions"; she proactively manages your world, from handling your emails to remembering the smallest details of your past interactions through her persistent **Knowledge Graph Memory**.

<p align="center">
  <img src="public/logo.png" width="180" alt="Aria Logo">
</p>

## 🌟 Key Features

- **🎙️ Real-time Voice Interface**: Powered by ElevenLabs for lifelike, emotional voice synthesis and low-latency interaction.
- **🧠 GraphMemory Engine**: A dedicated Knowledge Graph + Vector RAG system that stores your history, relations, and context.
- **📧 Autonomous Email Management**: Aria reads, summarizes, and drafts replies for your Gmail, prioritizing what matters.
- **📅 Proactive Calendar Sync**: Automatically detects deadlines and proposed meetings, syncing them directly to your Google Calendar.
- **📱 Telegram Integration**: Summarizes your missed messages and helps you stay on top of social threads.
- **🔒 Multi-Tenancy**: Built from the ground up to securely segment memory and data for multiple users.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), Vanilla CSS (Premium Aesthetics), Framer Motion.
- **Database**: Drizzle ORM + Neon (PostgreSQL) with `pgvector` support.
- **AI/LLM**: Anthropic Claude 3.5 Sonnet (Agent Logic), OpenAI (Embeddings).
- **Voice**: ElevenLabs SDK.
- **Memory Service**: Python FastAPI + GraphMemory (Hybrid RAG).
- **Auth**: Better Auth / Google OAuth.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/aria.git
cd aria
```

### 2. Infrastructure Setup
Aria requires a PostgreSQL database with the `pgvector` extension (Neon is recommended).

### 3. Environment Configuration
Copy the `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 4. Install Dependencies
```bash
npm install
cd GraphMemory/ai-service && pip install -r requirements.txt
```

### 5. Database Migrations
```bash
npx drizzle-kit push
```

### 6. Run the Ecosystem
You need to run both the Next.js app and the Python AI service:

**Start AI Service (Memory):**
```bash
cd GraphMemory/ai-service
uvicorn main:app --port 8000
```

**Start Aria Dashboard:**
```bash
npm run dev
```

---

## 🧬 Architecture

Aria uses a dual-service architecture:
1.  **Aria Core (Node.js)**: Handles the UI, Voice streaming, Google API integrations, and Agent loops.
2.  **Memory Service (Python)**: Handles entity extraction, Knowledge Graph upserts, and hybrid vector/graph retrieval.

---

## 🌐 Deployment

### Vercel (Frontend & API)
The main Aria application is optimized for Vercel. Ensure all environment variables are added to the Vercel dashboard.

### Docker (AI Service)
We recommend deploying the `GraphMemory` AI service as a Docker container:
```bash
cd GraphMemory
docker-compose up -d
```

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Built with ❤️ by the Aria Community</p># Aria
