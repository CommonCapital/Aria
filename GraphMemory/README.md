<p align="center">
  <img src="frontend/public/logo-3.png" width="120" alt="MemoryOS Logo">
</p>

# MemoryOS (Aria Edition) 🧠🕸️

**MemoryOS** is a high-fidelity Knowledge Graph + Vector RAG memory system. This version has been refactored specifically for **Aria**, adding **Multi-Tenancy support** and a **Hybrid retrieval engine** optimized for agentic workflows.

## 🚀 Key Features

### 1. Multi-Tenant Hybrid Retrieval
Every query is scoped by `user_id`, ensuring secure and private memory segments. It runs two parallel pipelines:
- **Path A (Vector):** Semantic similarity search against note chunks using `pgvector`.
- **Path B (Graph):** Semantic entry-point matching followed by a structural BFS traversal (Recursive CTE) through typed relations.
- **Fusion:** Results are merged, deduplicated, and boosted if verified by both systems.

![Retrieval Mechanics](frontend/public/rag_vs_graph_retrieval_mechanics.svg)

### 2. High-Fidelity Knowledge Graph
Nodes are not just buckets for notes; they are first-class entities (People, Concepts, Tech, etc.) with:
- **Typed Relations:** `is_a`, `causes`, `works_at`, `part_of`, and more.
- **Directional Links:** Solid arrows for 1-way relationships, double arrows for bidirectional.
- **Confidence Scores:** Visual translucency for AI-extracted relations with lower confidence.

### 3. Interactive Memory Visualization
- **Graph Explorer:** A React Flow-based canvas with automatic degree-based sizing and relation-aware styling.
- **Vector Cluster Map:** A 2D UMAP projection of your entire note library, allowing you to see semantic "islands" of thought.
- **Retrieval Inspector:** An X-ray view of the last AI query, showing the exact path the graph traversal took.

### 4. Memory Health Dashboard
Monitor your memory in real-time. Trigger batch re-indexing or re-extraction of entities across your entire database with a single click.

---

## 🛠️ Tech Stack

### Frontend (Next.js)
- **Framework:** Next.js 14 (App Router)
- **Graphing:** React Flow
- **Visualization:** Plotly.js (UMAP Projection)
- **State:** Zustand & SWR
- **Editor:** TipTap with Wikilink support

### AI Service (Python/FastAPI)
- **Engine:** FastAPI
- **LLM Orchestration:** LangChain (Anthropic Claude-3 / OpenAI GPT-4)
- **Embeddings:** Sentence-Transformers (`all-MiniLM-L6-v2`)
- **Analysis:** UMAP-Learn & Scikit-learn

### Database
- **Primary DB:** PostgreSQL
- **Vector Extension:** `pgvector`
- **ORM:** Prisma

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js v18+
- Python 3.10+
- PostgreSQL with `pgvector` installed

### 2. Environment Setup
Create a `.env.local` (frontend) and `.env` (ai-service) file:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/memoryos"
OPENAI_API_KEY="your_key"
ANTHROPIC_API_KEY="your_key"
AI_PROVIDER="anthropic" # or "openai"
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install
npx prisma db push

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 4. Run the Application
```bash
# Terminal 1: AI Service
cd ai-service
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🕸️ Graph Taxonomy
MemoryOS uses a canonical taxonomy for extracted relations to ensure consistency:
- **Structural:** `is_a`, `part_of`, `type_of`
- **Causal:** `causes`, `enables`, `requires`
- **Social:** `works_at`, `knows`, `founded`
- **Temporal:** `precedes`, `succeeded_by`
- **Hierarchy:** `broader_than`, `narrower_than`

---

## 🤖 AI Integration (MCP)
MemoryOS supports the **Model Context Protocol (MCP)**, allowing you to connect AI assistants (like Antigravity or Claude Code) directly to your knowledge base.

### Connecting an Assistant
1. **Build the MCP Server:**
   ```bash
   cd mcp-server
   npm install
   npm run build
   ```
2. **Configure your AI Client:**
   Add the following to your AI client's MCP configuration (e.g., `mcp-config.json`):
   ```json
   {
     "mcpServers": {
       "memoryos": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-server/dist/index.js"]
       }
     }
   }
   ```
### 3. Available Tools:
   Once connected, the AI can use tools like `search_notes`, `graph_query`, and `ask_memory` to interact with your data.

---

## 🧬 Aria Integration
This service is designed to be called by the Aria companion.
- **Memorize:** Call `/embed/note` (POST) after processing user input.
- **Recall:** Call `/rag/query/json` (POST) to get contextual history.
- **Multi-tenancy:** Always provide a `user_id` in the request body.

---

## 📜 License
MIT License - 2026 MemoryOS Team.
# MemoryOS
# MemoryOS
