import asyncpg
import os
import json
from contextlib import asynccontextmanager

import ssl

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://memoryos:memoryos@localhost:5432/memoryos")

_pool = None

async def init_pool():
    global _pool
    if _pool is None:
        # Check if we should use SSL (recommended for Neon/Cloud)
        ssl_ctx = False
        if "sslmode=require" in DATABASE_URL or ".neon.tech" in DATABASE_URL:
            ssl_ctx = ssl.create_default_context()
            ssl_ctx.check_hostname = False
            ssl_ctx.verify_mode = ssl.CERT_NONE

        _pool = await asyncpg.create_pool(
            DATABASE_URL,
            ssl=ssl_ctx,
            min_size=1,
            max_size=10,
            max_queries=50000,
            max_inactive_connection_lifetime=300.0
        )
        
        async with _pool.acquire() as conn:
            try:
                await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
            except Exception as e:
                print("Could not create vector extension (may already exist or insufficient permissions):", e)

async def close_pool():
    global _pool
    if _pool is not None:
        await _pool.close()

@asynccontextmanager
async def get_db():
    global _pool
    if _pool is None:
        await init_pool()
    async with _pool.acquire() as conn:
        yield conn
