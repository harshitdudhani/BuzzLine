import asyncio
import websockets
import json
from datetime import datetime
import os 
import jwt 
from aiohttp import web
from google.oauth2 import credentials
from google_auth_oauthlib.flow import Flow

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "https://buzz-line-indol.vercel.app/"
JWT_SECRET = 

connected_clients = set()

async def handler(websocket):
    print(f"New Client Connected: {websocket.remote_address}")
    connected_clients.add(websocket)

    try:
        async for message in websocket:
            print(f"Received message from {websocket.remote_address}: {message}")
            timestamp = datetime.utcnow().isoformat() + 'Z'
            message_to_send = json.dumps({"text": message, "timestamp": timestamp})
            tasks = [
                client.send(message_to_send)
                for client in connected_clients
                if client != websocket
            ]
            await asyncio.gather(*tasks)
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Client {websocket.remote_address} disconnected with code {e.code} and reason: {e.reason}")
    finally:
        connected_clients.remove(websocket)
        print(f"Client {websocket.remote_address} has been removed.")

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8000):
        print("WebSocket server started on ws://172.16.0.2:8000")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())

