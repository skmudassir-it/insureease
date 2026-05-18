from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL, maxPoolSize=50, minPoolSize=5, serverSelectionTimeoutMS=5000)

async def close_db():
    if client:
        client.close()

def get_db():
    return client[settings.MONGODB_DB_NAME]
