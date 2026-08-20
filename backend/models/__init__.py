"""
AGRO-SMART Database Client Connector (Supabase / In-Memory Fallback)
"""
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", os.getenv("SUPABASE_ANON_KEY", "")).strip()

supabase_client = None
is_database_configured = False

try:
    if (
        SUPABASE_URL 
        and SUPABASE_KEY 
        and not SUPABASE_URL.startswith("https://your-project")
        and not SUPABASE_KEY.startswith("your-")
    ):
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        is_database_configured = True
        print(f"[Supabase] Connected to PostgreSQL at {SUPABASE_URL[:25]}...")
    else:
        print("[Supabase] Running in local demo mode with in-memory stores.")
except Exception as e:
    print(f"[Supabase] Connection notice (local demo fallback active): {e}")

def get_database_status():
    """Returns whether live Supabase connection is established without exposing keys."""
    return is_database_configured
