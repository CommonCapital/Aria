import json
from typing import List
from models.schemas import ChunkResult, NoteResult
from db.postgres import get_db

async def vector_search(user_id: str, embedding: List[float], top_k: int) -> List[ChunkResult]:
    embed_str = json.dumps(embedding)
    query = """
        SELECT id, "note_id", content, 1 - (embedding <=> $1::vector) as score
        FROM chunks
        WHERE "user_id" = $3
        ORDER BY embedding <=> $1::vector
        LIMIT $2
    """
    async with get_db() as conn:
        rows = await conn.fetch(query, embed_str, top_k, user_id)
        
    return [ChunkResult(id=str(r['id']), note_id=str(r['note_id']), content=r['content'], score=r['score']) for r in rows]

async def note_search(user_id: str, embedding: List[float], top_k: int) -> List[NoteResult]:
    embed_str = json.dumps(embedding)
    query = """
        SELECT id, title, content, 1 - (embedding <=> $1::vector) as score
        FROM notes
        WHERE "user_id" = $3
        ORDER BY embedding <=> $1::vector
        LIMIT $2
    """
    async with get_db() as conn:
        rows = await conn.fetch(query, embed_str, top_k, user_id)
        
    return [NoteResult(id=str(r['id']), title=r['title'], content=r['content'], score=r['score']) for r in rows]
