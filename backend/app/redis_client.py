import redis.asyncio as aioredis
from app.config import settings

redis: aioredis.Redis = None

async def connect_redis():
    global redis
    redis = aioredis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True, max_connections=20)

async def close_redis():
    if redis:
        await redis.aclose()

def get_redis():
    return redis
