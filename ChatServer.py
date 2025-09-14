import asyncio
import websockets
import json
from datetime import datetime

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
        print("WebSocket server started on ws://<your-ip-address>:8765")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())

