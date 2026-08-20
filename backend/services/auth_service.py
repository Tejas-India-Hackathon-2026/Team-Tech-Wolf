"""
AGRO-SMART Authentication Service
Handles user registration, credential verification, password hashing, session tokens,
and admin user management.
Supports local demo mode with in-memory stores and Supabase database fallback.
"""
import hashlib
import time
import uuid
import os
from models import supabase_client

# Salt for demo password hashing
AUTH_SALT = "agro_smart_secret_salt_2026"

def _hash_password(password: str) -> str:
    """Generates salted SHA-256 hash for secure credential storage."""
    return hashlib.sha256(f"{password}:{AUTH_SALT}".encode()).hexdigest()

# Pre-seeded Hackathon Demo Accounts (Farmer, Machinery Owner, and Admin)
INITIAL_DEMO_USERS = [
    {
        "id": "usr-demo-admin-00",
        "name": "AGRO-SMART System Admin",
        "email": "admin@agro-smart.com",
        "phone": "9876500000",
        "password_hash": _hash_password("Admin@123"),
        "user_type": "Admin",
        "state": "Maharashtra",
        "district": "Pune",
        "avatar": "🛡️",
        "status": "Active",
        "created_at": "2026-08-01 08:00:00"
    },
    {
        "id": "usr-demo-farmer-01",
        "name": "Rameshwar Patel",
        "email": "farmer@agro-smart.com",
        "phone": "9876543210",
        "password_hash": _hash_password("Farmer@123"),
        "user_type": "Farmer",
        "state": "Bihar",
        "district": "Patna",
        "avatar": "👨‍🌾",
        "status": "Active",
        "created_at": "2026-08-01 10:00:00"
    },
    {
        "id": "usr-demo-owner-02",
        "name": "Suresh Singh Machinery",
        "email": "owner@agro-smart.com",
        "phone": "9876543211",
        "password_hash": _hash_password("Owner@123"),
        "user_type": "Machinery Owner",
        "state": "Maharashtra",
        "district": "Pune",
        "avatar": "🚜",
        "status": "Active",
        "created_at": "2026-08-01 11:30:00"
    }
]

# In-memory user database for demo session resilience
USERS_STORE = list(INITIAL_DEMO_USERS)
SESSIONS_STORE = {}

def register_user(data: dict):
    """
    Registers a new user (Farmer or Machinery Owner).
    Validates required fields, checks for duplicate email/phone, hashes password.
    Enforces security constraint: Users can NEVER self-register as Admin.
    """
    name = (data.get("name") or data.get("fullName") or "").strip()
    phone = (data.get("phone") or data.get("mobileNumber") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user_type = data.get("user_type") or data.get("userType") or "Farmer"
    state = (data.get("state") or "Maharashtra").strip()
    district = (data.get("district") or "Pune").strip()

    if not name:
        return None, "Full name is required."
    if not phone or len(phone) < 10:
        return None, "Valid 10-digit mobile number is required."
    if not email or "@" not in email:
        return None, "Valid email address is required."
    if not password or len(password) < 6:
        return None, "Password must be at least 6 characters long."
    
    # Strictly forbid public Admin registration
    if user_type not in ["Farmer", "Machinery Owner"]:
        user_type = "Farmer"

    # Check for duplicate phone or email in local memory
    for u in USERS_STORE:
        if u["phone"] == phone:
            return None, "An account with this mobile number already exists. Please log in."
        if u["email"] == email:
            return None, "An account with this email address already exists. Please log in."

    new_user = {
        "id": f"usr-{uuid.uuid4().hex[:10]}",
        "name": name,
        "email": email,
        "phone": phone,
        "password_hash": _hash_password(password),
        "user_type": user_type,
        "state": state,
        "district": district,
        "avatar": "🚜" if user_type == "Machinery Owner" else "👨‍🌾",
        "status": "Active",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    # Save to Supabase if live database is connected
    try:
        if supabase_client:
            record = {
                "id": new_user["id"],
                "name": name,
                "email": email,
                "phone": phone,
                "user_type": user_type,
                "state": state,
                "district": district
            }
            supabase_client.table("users").insert(record).execute()
    except Exception as e:
        print(f"[Supabase] User insert notice (using in-memory store): {e}")

    USERS_STORE.append(new_user)

    # Generate session token and public profile
    token = f"demo-tok-{uuid.uuid4().hex}"
    SESSIONS_STORE[token] = new_user["id"]

    public_user = _sanitize_user(new_user)
    return {
        "user": public_user,
        "token": token,
        "is_demo_session": True,
        "message": "Account created successfully"
    }, None

def authenticate_user(identifier: str, password: str):
    """
    Authenticates user via Mobile Number or Email + Password.
    Returns sanitized user profile and session token.
    """
    clean_id = (identifier or "").strip().lower()
    if not clean_id:
        return None, "Please enter your mobile number or email."
    if not password:
        return None, "Please enter your password."

    hashed_input = _hash_password(password)

    # Search user store
    matched_user = None
    for u in USERS_STORE:
        if u["email"].lower() == clean_id or u["phone"] == clean_id:
            matched_user = u
            break

    if not matched_user:
        return None, "No account found with this mobile number or email. Please check or register."

    if matched_user.get("status") == "Disabled":
        return None, "This account has been disabled by the administrator."

    if matched_user["password_hash"] != hashed_input:
        return None, "Invalid password. Please check and try again."

    # Generate session
    token = f"demo-tok-{uuid.uuid4().hex}"
    SESSIONS_STORE[token] = matched_user["id"]

    public_user = _sanitize_user(matched_user)
    return {
        "user": public_user,
        "token": token,
        "is_demo_session": True,
        "message": f"Welcome back, {matched_user['name']}!"
    }, None

def get_user_by_token(token: str):
    """Retrieves authenticated user profile from active session token."""
    if not token or token not in SESSIONS_STORE:
        return None, "Session expired or invalid. Please log in again."

    user_id = SESSIONS_STORE[token]
    for u in USERS_STORE:
        if u["id"] == user_id:
            return _sanitize_user(u), None

    return None, "User not found."

def logout_token(token: str):
    """Invalidates active session token."""
    if token and token in SESSIONS_STORE:
        del SESSIONS_STORE[token]
    return True

# Admin User Management Methods
def get_all_users():
    """Returns list of all sanitized user accounts for the Admin Dashboard."""
    return [_sanitize_user(u) for u in USERS_STORE]

def toggle_user_status(user_id: str):
    """Enables or disables a demo user account."""
    for u in USERS_STORE:
        if u["id"] == user_id:
            if u.get("user_type") == "Admin":
                return None, "Cannot disable the primary Admin account."
            u["status"] = "Disabled" if u.get("status") == "Active" else "Active"
            return _sanitize_user(u), None
    return None, "User not found."

def change_user_role(user_id: str, new_role: str):
    """
    Toggles user role between Farmer and Machinery Owner.
    Strictly forbids promoting any regular user to Admin.
    """
    if new_role not in ["Farmer", "Machinery Owner"]:
        return None, "Invalid role. Role must be 'Farmer' or 'Machinery Owner'."

    for u in USERS_STORE:
        if u["id"] == user_id:
            if u.get("user_type") == "Admin":
                return None, "Cannot modify Admin account role."
            u["user_type"] = new_role
            u["avatar"] = "🚜" if new_role == "Machinery Owner" else "👨‍🌾"
            return _sanitize_user(u), None
    return None, "User not found."

def _sanitize_user(user: dict) -> dict:
    """Removes sensitive password hashes before returning user profile to frontend."""
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "user_type": user["user_type"],
        "state": user["state"],
        "district": user["district"],
        "avatar": user.get("avatar", "👨‍🌾"),
        "status": user.get("status", "Active"),
        "created_at": user.get("created_at")
    }
