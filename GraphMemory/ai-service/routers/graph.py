from fastapi import APIRouter, BackgroundTasks, Query
from db.postgres import get_db
import json
from typing import List, Optional

router = APIRouter()

@router.get("/full")
async def get_full_graph():
    async with get_db() as conn:
        nodes_rows = await conn.fetch('''
            SELECT id, label, type, "note_id", properties,
            (SELECT COUNT(*) FROM graph_edges WHERE "source_id" = graph_nodes.id OR "target_id" = graph_nodes.id) as degree
            FROM graph_nodes
        ''')
        edges_rows = await conn.fetch('SELECT id, "source_id", "target_id", relation, weight, direction, confidence FROM graph_edges')
        
    nodes = [{"id": str(r['id']), "data": {"label": r['label'], "type": r['type'], "degree": r['degree']}, "type": "customNode", "position": {"x": 0, "y": 0}} for r in nodes_rows]
    edges = [{"id": str(r['id']), "source": str(r['source_id']), "target": str(r['target_id']), "label": r['relation'], "data": {"weight": r['weight'], "direction": r['direction'], "confidence": r['confidence']}} for r in edges_rows]
    
    return {"nodes": nodes, "edges": edges}

@router.get("/neighbors/{node_id}")
async def get_neighbors(node_id: str, hops: int = 2):
    async with get_db() as conn:
        query = '''
            WITH RECURSIVE bfs AS (
                SELECT id, label, type, 0 as depth FROM graph_nodes WHERE id = $1::uuid
                UNION
                SELECT n.id, n.label, n.type, b.depth + 1
                FROM bfs b
                JOIN graph_edges e ON (e."source_id" = b.id OR e."target_id" = b.id)
                JOIN graph_nodes n ON n.id = (CASE WHEN e."source_id" = b.id THEN e."target_id" ELSE e."source_id" END)
                WHERE b.depth < $2
            )
            SELECT id, label, type FROM bfs
        '''
        nodes = await conn.fetch(query, node_id, hops)
        node_ids = [n['id'] for n in nodes]
        
        edges = []
        if node_ids:
            edges = await conn.fetch('SELECT id, "source_id", "target_id", relation, weight, direction, confidence FROM graph_edges WHERE "source_id" = ANY($1::uuid[]) AND "target_id" = ANY($1::uuid[])', node_ids)
            
    res_nodes = [{"id": str(r['id']), "data": {"label": r['label'], "type": r['type']}, "type": "customNode", "position": {"x": 0, "y": 0}} for r in nodes]
    res_edges = [{"id": str(r['id']), "source": str(r['source_id']), "target": str(r['target_id']), "label": r['relation'], "data": {"weight": r['weight'], "direction": r['direction'], "confidence": r['confidence']}} for r in edges]
    
    return {"nodes": res_nodes, "edges": res_edges} 

@router.get("/similar-notes/{note_id}")
async def get_similar_notes(note_id: str):
    async with get_db() as conn:
        note = await conn.fetchrow("SELECT embedding FROM notes WHERE id = $1", note_id)
        if not note or not note['embedding']:
            return {"notes": []}
            
        similar = await conn.fetch('''
            SELECT id, title, 1 - (embedding <=> $1::vector) as score
            FROM notes
            WHERE id != $2
            ORDER BY embedding <=> $1::vector
            LIMIT 5
        ''', note['embedding'], note_id)
        
    return {"notes": [{"id": str(r['id']), "title": r['title'], "score": r['score']} for r in similar]}

@router.get("/path")
async def get_graph_path(from_id: str = Query(..., alias="from"), to_id: str = Query(..., alias="to"), max_hops: int = 4):
    async with get_db() as conn:
        query = '''
            WITH RECURSIVE path_search AS (
                SELECT id, ARRAY[id] as path, 0 as depth
                FROM graph_nodes WHERE id = $1::uuid
                
                UNION ALL
                
                SELECT n.id, ps.path || n.id, ps.depth + 1
                FROM path_search ps
                JOIN graph_edges e ON (e."source_id" = ps.id OR e."target_id" = ps.id)
                JOIN graph_nodes n ON n.id = (CASE WHEN e."source_id" = ps.id THEN e."target_id" ELSE e."source_id" END)
                WHERE ps.depth < $3 AND NOT (n.id = ANY(ps.path))
            )
            SELECT path FROM path_search WHERE id = $2::uuid ORDER BY depth ASC LIMIT 1
        '''
        res = await conn.fetchrow(query, from_id, to_id, max_hops)
        if not res:
            return {"path": []}
            
        # retrieve nodes and edges for the path
        path_ids = res['path']
        edges_in_path = []
        for i in range(len(path_ids)-1):
            src = path_ids[i]
            tgt = path_ids[i+1]
            edge = await conn.fetchrow('SELECT "source_id", "target_id", relation, direction FROM graph_edges WHERE ("source_id"=$1 AND "target_id"=$2) OR ("source_id"=$2 AND "target_id"=$1) LIMIT 1', src, tgt)
            if edge:
                edges_in_path.append(dict(edge))
                
        return {"path": edges_in_path}

@router.get("/relations/types")
async def get_relation_types():
    async with get_db() as conn:
        rows = await conn.fetch('SELECT relation, COUNT(*) as count FROM graph_edges GROUP BY relation ORDER BY count DESC')
        return {"relations": [{"type": r['relation'], "count": r['count']} for r in rows]}

@router.get("/node/{id}/relations")
async def get_node_relations(id: str):
    async with get_db() as conn:
        node = await conn.fetchrow('SELECT label, type FROM graph_nodes WHERE id = $1::uuid', id)
        if not node: return {"error": "not found"}
        
        out_edges = await conn.fetch('''
            SELECT e.relation, e.weight, n.label as target_label, n.id as target_id 
            FROM graph_edges e JOIN graph_nodes n ON e."target_id" = n.id 
            WHERE e."source_id" = $1::uuid
        ''', id)
        
        in_edges = await conn.fetch('''
            SELECT e.relation, e.weight, n.label as source_label, n.id as source_id 
            FROM graph_edges e JOIN graph_nodes n ON e."source_id" = n.id 
            WHERE e."target_id" = $1::uuid
        ''', id)
        
        similar = await conn.fetch('''
            SELECT s.score, n.label, n.id 
            FROM node_similarities s JOIN graph_nodes n ON (CASE WHEN s."node_a_id"=$1::uuid THEN s."node_b_id" ELSE s."node_a_id" END) = n.id
            WHERE s."node_a_id" = $1::uuid OR s."node_b_id" = $1::uuid
            ORDER BY s.score DESC LIMIT 5
        ''', id)
        
        return {
            "node": dict(node),
            "outgoing": [dict(e) for e in out_edges],
            "incoming": [dict(e) for e in in_edges],
            "similar": [dict(s) for s in similar]
        }

@router.post("/node-similarity/compute")
async def compute_node_similarities(background_tasks: BackgroundTasks):
    async def bg_compute():
        async with get_db() as conn:
            # simple cross join for similarity > 0.6
            await conn.execute('''
                INSERT INTO node_similarities ("node_a_id", "node_b_id", score)
                SELECT a.id, b.id, 1 - (a.embedding <=> b.embedding)
                FROM graph_nodes a JOIN graph_nodes b ON a.id < b.id
                WHERE a.embedding IS NOT NULL AND b.embedding IS NOT NULL AND 1 - (a.embedding <=> b.embedding) > 0.6
                ON CONFLICT ("node_a_id", "node_b_id") DO UPDATE SET score = EXCLUDED.score
            ''')
    background_tasks.add_task(bg_compute)
    return {"status": "computing"}

@router.get("/subgraph")
async def get_filtered_subgraph(relation: str = None, min_confidence: float = 0.0):
    async with get_db() as conn:
        edges_query = 'SELECT id, "source_id", "target_id", relation, weight, direction, confidence FROM graph_edges WHERE confidence >= $1'
        args = [min_confidence]
        if relation:
            edges_query += ' AND relation = $2'
            args.append(relation)
            
        edges_rows = await conn.fetch(edges_query, *args)
        if not edges_rows: return {"nodes": [], "edges": []}
        
        edge_ids = set()
        for e in edges_rows:
            edge_ids.add(e['source_id'])
            edge_ids.add(e['target_id'])
            
        nodes_rows = await conn.fetch('SELECT id, label, type FROM graph_nodes WHERE id = ANY($1::uuid[])', list(edge_ids))
        
        nodes = [{"id": str(r['id']), "data": {"label": r['label'], "type": r['type']}, "type": "customNode", "position": {"x": 0, "y": 0}} for r in nodes_rows]
        edges = [{"id": str(r['id']), "source": str(r['source_id']), "target": str(r['target_id']), "label": r['relation'], "data": {"weight": r['weight'], "direction": r['direction'], "confidence": r['confidence']}} for r in edges_rows]
        
        return {"nodes": nodes, "edges": edges}

@router.post("/reextract-all")
async def reextract_all(background_tasks: BackgroundTasks):
    from services.graph_service import extract_entities, upsert_graph
    from services.embedding_service import embed_text
    async def run_reextract():
        async with get_db() as conn:
            notes = await conn.fetch("SELECT id, title, content FROM notes")
        for note in notes:
            text = f"{note['title']}\n{note['content']}"
            extraction = await extract_entities(text)
            
            # Simple embedding map for nodes
            embeddings_map = {}
            for n in extraction.nodes:
                embeddings_map[n.label] = embed_text(n.label)
                
            await upsert_graph(str(note['id']), extraction.nodes, extraction.edges, embeddings_map)
            
    background_tasks.add_task(run_reextract)
    return {"status": "started"}
