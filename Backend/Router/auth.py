from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from db.models import get_session, User
from db import crud
import uuid, hashlib, hmac, os, base64, time
import jwt
from datetime import datetime, timedelta, timezone

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET") or os.getenv("APP_SECRET", "dev-secret-change")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MIN", "10080"))  # default 7 days

def hash_password(password: str) -> str:
	salt = os.urandom(16)
	dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 390000)
	return base64.b64encode(salt + dk).decode()

def verify_password(password: str, stored: str) -> bool:
	try:
		raw = base64.b64decode(stored.encode())
		salt, dk = raw[:16], raw[16:]
		test = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 390000)
		return hmac.compare_digest(dk, test)
	except Exception:
		return False

def create_access_token(user_id: str) -> str:
	"""Generate a signed JWT access token."""
	now = datetime.now(timezone.utc)
	exp = now + timedelta(minutes=JWT_EXPIRE_MIN)
	payload = {"sub": user_id, "iat": int(now.timestamp()), "exp": int(exp.timestamp()), "type": "access"}
	return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> str | None:
	try:
		data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
		return data.get("sub")
	except jwt.ExpiredSignatureError:
		return None
	except Exception:
		return None

class RegisterRequest(BaseModel):
	email: EmailStr
	password: str
	display_name: str | None = None

class AuthResponse(BaseModel):
	token: str
	user_id: str
	email: EmailStr
	display_name: str | None = None

class LoginRequest(BaseModel):
	email: EmailStr
	password: str

class ProfileOut(BaseModel):
	user_id: str
	email: EmailStr
	display_name: str | None
	created_at: int
	theme_pref: str | None = None

class ProfileUpdate(BaseModel):
	display_name: str
	theme_pref: str | None = None

class ChangePasswordBody(BaseModel):
	old_password: str
	new_password: str

class APIKeysIn(BaseModel):
	gemini: str | None = None
	groq1: str | None = None
	groq2: str | None = None
	groq3: str | None = None

class APIKeysOut(BaseModel):
	gemini: bool | None = None
	groq1: bool | None = None
	groq2: bool | None = None
	groq3: bool | None = None

def get_current_user_id(authorization: str | None = Header(default=None)) -> str:
	if not authorization or not authorization.lower().startswith('bearer '):
		raise HTTPException(status_code=401, detail='Missing bearer token')
	token = authorization.split(' ',1)[1]
	uid = decode_token(token)
	if not uid:
		raise HTTPException(status_code=401, detail='Invalid or expired token')
	return uid

@auth_router.get('/health')
def auth_health():
	return {"status": "ok"}

@auth_router.post('/register', response_model=AuthResponse)
def register(body: RegisterRequest):
	with get_session() as session:
		if crud.get_user_by_email(session, body.email):
			raise HTTPException(status_code=400, detail="Email already registered")
		if len(body.password) < 6:
			raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
		user_id = str(uuid.uuid4())
		password_hash = hash_password(body.password)
		user = crud.create_user_with_password(session, user_id, body.email, password_hash, body.display_name)
		token = create_access_token(user.id)
		return AuthResponse(token=token, user_id=user.id, email=user.email, display_name=user.display_name)

@auth_router.post('/login', response_model=AuthResponse)
def login(body: LoginRequest):
	with get_session() as session:
		user = crud.get_user_by_email(session, body.email)
		if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
			raise HTTPException(status_code=401, detail="Invalid credentials")
		token = create_access_token(user.id)
		return AuthResponse(token=token, user_id=user.id, email=user.email, display_name=user.display_name)

@auth_router.get('/me', response_model=ProfileOut)
def me(user_id: str = Depends(get_current_user_id)):
	with get_session() as session:
		user = session.get(crud.User, user_id) if hasattr(crud,'User') else None  # fallback
		if not user:
			# direct query
			user = crud.get_user_by_email(session, user_id)  # unlikely match; keep for legacy
		if not user:
			raise HTTPException(status_code=404, detail='User not found')
		return ProfileOut(user_id=user.id, email=user.email, display_name=user.display_name, created_at=int(user.created_at.timestamp()), theme_pref=getattr(user, 'theme_pref', None))

@auth_router.patch('/profile', response_model=ProfileOut)
def update_profile(body: ProfileUpdate, user_id: str = Depends(get_current_user_id)):
	with get_session() as session:
		user = session.get(crud.User, user_id) if hasattr(crud,'User') else None
		if not user:
			raise HTTPException(status_code=404, detail='User not found')
		user.display_name = body.display_name.strip()[:100]
		if body.theme_pref in (None, 'light', 'dark'):
			user.theme_pref = body.theme_pref
		session.commit(); session.refresh(user)
		return ProfileOut(user_id=user.id, email=user.email, display_name=user.display_name, created_at=int(user.created_at.timestamp()), theme_pref=getattr(user,'theme_pref',None))

@auth_router.post('/change-password')
def change_password(body: ChangePasswordBody, user_id: str = Depends(get_current_user_id)):
	if len(body.new_password) < 6:
		raise HTTPException(status_code=400, detail='New password too short')
	with get_session() as session:
		user = session.get(crud.User, user_id) if hasattr(crud,'User') else None
		if not user or not user.password_hash:
			raise HTTPException(status_code=404, detail='User not found')
		if not verify_password(body.old_password, user.password_hash):
			raise HTTPException(status_code=401, detail='Old password incorrect')
		user.password_hash = hash_password(body.new_password)
		session.commit()
		return {"status":"success"}

@auth_router.put('/api-keys', response_model=APIKeysOut)
def set_api_keys(body: APIKeysIn, user_id: str = Depends(get_current_user_id)):
	with get_session() as session:
		user = session.get(crud.User, user_id) if hasattr(crud, 'User') else None
		if not user:
			raise HTTPException(status_code=404, detail='User not found')
		current = user.api_keys or {}
		# Update only provided keys
		for k, v in body.model_dump().items():
			if v is not None:
				current[k] = v.strip()
		user.api_keys = current
		session.commit(); session.refresh(user)
		# Return boolean presence (avoid leaking actual secret back)
		return APIKeysOut(**{k: (k in current and bool(current[k])) for k in ['gemini','groq1','groq2','groq3']})

@auth_router.get('/api-keys', response_model=APIKeysOut)
def get_api_keys(user_id: str = Depends(get_current_user_id)):
	with get_session() as session:
		user = session.get(crud.User, user_id) if hasattr(crud,'User') else None
		if not user:
			raise HTTPException(status_code=404, detail='User not found')
		current = user.api_keys or {}
		return APIKeysOut(**{k: (k in current and bool(current[k])) for k in ['gemini','groq1','groq2','groq3']})

