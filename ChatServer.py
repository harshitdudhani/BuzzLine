import asyncio
import json
from datetime import datetime, timedelta
import os 
import jwt 
from aiohttp import web
from google.oauth2 import credentials
from google_auth_oauthlib.flow import Flow
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET") 
REDIRECT_URI = os.getenv("REDIRECT_URI") 

connected_clients = {}

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    try:
        token = request.rel_url.query.get('token')
        if not token:
            raise jwt.InvalidTokenError("Token not provided")
            
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_info = {"name": payload["name"], "email": payload["email"]}

    except (jwt.InvalidTokenError, KeyError) as e:
        print(f"Authentication failed: {e}")
        await ws.close(code=4001, reason="Invalid or missing token")
        return ws

    print(f"User '{user_info['name']}' connected.")
    connected_clients[ws] = user_info

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                message_text = msg.data
                timestamp = datetime.utcnow().isoformat() + 'Z'
                
                message_to_send = json.dumps({
                    "text": message_text, 
                    "timestamp": timestamp,
                    "sender": user_info['name']
                })
                
                for client in connected_clients:
                    await client.send_str(message_to_send)

            elif msg.type == web.WSMsgType.ERROR:
                print(f"WebSocket connection closed with exception {ws.exception()}")

    finally:
        if ws in connected_clients:
            print(f"User '{connected_clients[ws]['name']}' has been disconnected.")
            del connected_clients[ws]
            
    return ws

async def google_login(request):
    if not os.path.exists('client_secret.json'):
        return web.Response(text="OAuth client_secret.json not found on server.", status=500)
    
    flow = Flow.from_client_secrets_file(
        'client_secret.json',
        scopes=['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid'],
        redirect_uri=REDIRECT_URI
    )
    authorization_url, state = flow.authorization_url()
    return web.HTTPFound(authorization_url)

async def google_callback(request):
    code = request.query.get('code')
    flow = Flow.from_client_secrets_file('client_secret.json', scopes=None, redirect_uri=REDIRECT_URI)
    
    try:
        flow.fetch_token(code=code)
    except Exception as e:
        print(f"Error fetching token from Google: {e}")
        return web.HTTPFound("https://buzz-line-indol.vercel.app/login?error=auth_failed")

    session = flow.authorized_session()
    profile_info = session.get('https://www.googleapis.com/oauth2/v2/userinfo').json()

    payload = {
        "email": profile_info.get('email'), 
        "name": profile_info.get('name'),
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    app_jwt = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    frontend_callback_url = "https://buzz-line-indol.vercel.app/auth/callback"
    return web.HTTPFound(f"{frontend_callback_url}?token={app_jwt}")

app = web.Application()

app.router.add_get("/ws", websocket_handler)
app.router.add_get("/login/google", google_login)
app.router.add_get("/api/auth/google/callback", google_callback)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    
    if not JWT_SECRET or not REDIRECT_URI:
        print("FATAL ERROR: Required environment variables (JWT_SECRET, REDIRECT_URI) are not set.")
    else:
        print(f"Starting server on http://0.0.0.0:{port}")
        web.run_app(app, host="0.0.0.0", port=port)