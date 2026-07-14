from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

# User retrieval moved inside function for ASGI safety

@database_sync_to_async
def get_user(token_key):
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        access_token = AccessToken(token_key)
        user_id = access_token.get('user_id')
        
        # Try finding user by ID (handles both int and UUID)
        try:
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError):
            # If user_id is an Int but model expects UUID (or vice versa), try alternate formats
            try:
                user = User.objects.get(id=str(user_id))
            except (User.DoesNotExist, ValueError):
                 return AnonymousUser()
                 
        return user
    except Exception:
        return AnonymousUser()

class TokenAuthMiddleware:
    """Custom middleware for JWT Auth in WebSockets"""
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        token = None
        for param in query_string.split("&"):
            if param.startswith("token="):
                # Use split with maxsplit=1 to avoid issues with tokens containing '='
                parts = param.split("=", 1)
                if len(parts) > 1:
                    token = parts[1]
                break

        if token:
            user = await get_user(token)
            scope['user'] = user
            if user.is_anonymous:
                print(f"DEBUG: Connection rejected: Anonymous user after token authentication.")
            else:
                print(f"DEBUG: Connection allowed: User {user.email} authenticated via token.")
        else:
            scope['user'] = AnonymousUser()
            print(f"DEBUG: Connection rejected: No token provided. User is Anonymous.")

        return await self.inner(scope, receive, send)
