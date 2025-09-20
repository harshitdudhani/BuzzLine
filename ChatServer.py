import asyncio
import json
from datetime import datetime, timedelta
import os
import jwt
from aiohttp import web
from google.oauth2 import credentials
from google_auth_oauthlib.flow import Flow
from dotenv import load_dotenv

# --- Load Environment Variables ---
load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# In-memory store for connected clients
connected_clients = {}

# --- WebSocket Handler ---
async def websocket_handler(request):
    """Handles WebSocket connections, authentication, and message broadcasting."""
    print("\n[DEBUG] Attempting to establish a new WebSocket connection...")
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    try:
        # 1. Authenticate the connection via JWT
        token = request.rel_url.query.get('token')
        print(f"[DEBUG] Received token from client: {token[:30]}..." if token else "No token received.")
        if not token:
            print("[ERROR] Token not provided by the client.")
            raise jwt.InvalidTokenError("Token not provided")

        # 2. Decode the JWT
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        print(f"[DEBUG] Successfully decoded JWT. Payload: {payload}")
        user_info = {"name": payload["name"], "email": payload["email"]}

    except (jwt.InvalidTokenError, KeyError) as e:
        # Handle failed authentication
        print(f"[ERROR] WebSocket authentication failed: {e}")
        await ws.close(code=4001, message=b"Invalid or missing token")
        return ws

    # 3. Add authenticated client to the connection pool
    print(f"[INFO] User '{user_info['name']}' ({user_info['email']}) successfully connected.")
    connected_clients[ws] = user_info
    print(f"[DEBUG] Total connected clients: {len(connected_clients)}")

    try:
        # 4. Listen for incoming messages
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                message_text = msg.data
                print(f"[DEBUG] Received message from '{user_info['name']}': '{message_text}'")
                
                # 5. Prepare message for broadcasting
                timestamp = datetime.utcnow().isoformat() + 'Z'
                message_to_send = json.dumps({
                    "text": message_text,
                    "timestamp": timestamp,
                    "sender": user_info['name']
                })
                
                # 6. Broadcast the message to all connected clients
                print(f"[DEBUG] Broadcasting message to {len(connected_clients)} client(s)...")
                for client in connected_clients:
                    await client.send_str(message_to_send)
                print("[DEBUG] Broadcast complete.")

            elif msg.type == web.WSMsgType.ERROR:
                print(f"[ERROR] WebSocket connection closed with exception {ws.exception()}")

    finally:
        # 7. Clean up when a client disconnects
        if ws in connected_clients:
            print(f"[INFO] User '{connected_clients[ws]['name']}' has disconnected.")
            del connected_clients[ws]
            print(f"[DEBUG] Total connected clients remaining: {len(connected_clients)}")

    return ws

# --- Google OAuth Login ---
async def google_login(request):
    """Initiates the Google OAuth2 login flow."""
    print("\n[DEBUG] Hit /login/google endpoint. Initiating OAuth flow.")

    # VITAL DEBUG STEP: Print the exact URI being used at runtime.
    print(f"[!!!! IMPORTANT DEBUG !!!!] The REDIRECT_URI being used is: '{REDIRECT_URI}'")

    if not os.path.exists('client_secret.json'):
        print("[ERROR] 'client_secret.json' not found on the server.")
        return web.Response(text="OAuth client_secret.json not found on server.", status=500)
    
    flow = Flow.from_client_secrets_file(
        'client_secret.json',
        scopes=['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email', 'openid'],
        redirect_uri=REDIRECT_URI  # This is the variable we are printing above
    )
    authorization_url, state = flow.authorization_url()
    print(f"[DEBUG] Generated Google authorization URL. Redirecting user...")
    return web.HTTPFound(authorization_url)


# --- Google OAuth Callback ---
async def google_callback(request):
    """Handles the callback from Google after user authentication."""
    print("\n[DEBUG] Hit /api/auth/google/callback endpoint.")
    code = request.query.get('code')
    if not code:
        print("[ERROR] No 'code' parameter found in Google callback.")
        return web.HTTPBadRequest(text="Authorization code not found in callback.")
        
    print(f"[DEBUG] Received authorization code from Google: {code[:30]}...")

    flow = Flow.from_client_secrets_file('client_secret.json', scopes=None, redirect_uri=REDIRECT_URI)

    try:
        print("[DEBUG] Exchanging authorization code for an access token...")
        flow.fetch_token(code=code)
        print("[DEBUG] Access token fetched successfully.")
    except Exception as e:
        print(f"[ERROR] Critical error fetching token from Google: {e}")
        return web.HTTPFound("https://buzz-line-indol.vercel.app/login?error=auth_failed")

    # Fetch user profile
    session = flow.authorized_session()
    print("[DEBUG] Fetching user profile information from Google...")
    profile_info = session.get('https://www.googleapis.com/oauth2/v2/userinfo').json()
    print(f"[DEBUG] Received profile info: {profile_info}")

    # Create our application's JWT
    payload = {
        "email": profile_info.get('email'),
        "name": profile_info.get('name'),
        "exp": datetime.utcnow() + timedelta(hours=24) # Token expires in 24 hours
    }
    app_jwt = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    print(f"[DEBUG] Generated application JWT for '{payload['name']}': {app_jwt[:30]}...")

    # Redirect user back to the frontend with the JWT
    frontend_callback_url = "https://buzz-line-indol.vercel.app/auth/callback"
    final_redirect_url = f"{frontend_callback_url}?token={app_jwt}"
    print(f"[DEBUG] Redirecting user back to frontend...")
    return web.HTTPFound(final_redirect_url)

# --- AioHTTP App Setup ---
app = web.Application()

app.router.add_get("/ws", websocket_handler)
app.router.add_get("/login/google", google_login)
app.router.add_get("/api/auth/google/callback", google_callback)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))

    # --- Pre-run Checks ---
    print("--- Initializing Server ---")
    if not JWT_SECRET or not REDIRECT_URI:
        print("\n[FATAL ERROR] Required environment variables (JWT_SECRET, REDIRECT_URI) are not set.")
        print("Please check your .env file or environment configuration.")
    else:
        print("[OK] Environment variables loaded:")
        print(f"  - JWT_SECRET: {'*' * 10}{JWT_SECRET[-4:]}") # Obfuscate for security
        print(f"  - REDIRECT_URI: {REDIRECT_URI}")
        print("---------------------------")
        print(f"✅ Starting server on http://0.0.0.0:{port}")
        web.run_app(app, host="0.0.0.0", port=port)

