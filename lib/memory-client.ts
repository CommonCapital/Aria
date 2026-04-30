export interface MemoryResult {
    note_id: string;
    content: string;
    score: number;
    source: string;
    path: any[];
}

export class MemoryClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.MEMORY_SERVICE_URL || "http://localhost:8000";
    }

    async memorize(noteId: string, title: string, content: string, userId: string) {
        try {
            const res = await fetch(`${this.baseUrl}/embed/note`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: noteId, title, content, user_id: userId }),
            });
            return await res.json();
        } catch (error) {
            console.error("[MemoryClient] Memorize failed:", error);
            return null;
        }
    }

    async search(query: string, userId: string, topK: number = 5): Promise<MemoryResult[]> {
        try {
            const res = await fetch(`${this.baseUrl}/rag/query/json`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, user_id: userId, top_k: topK }),
            });
            
            if (!res.ok) return [];
            const data = await res.json();
            return data.results || [];
        } catch (error) {
            console.error("[MemoryClient] Search failed:", error);
            return [];
        }
    }
}

export const memoryClient = new MemoryClient();
