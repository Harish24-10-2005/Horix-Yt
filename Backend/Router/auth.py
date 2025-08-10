from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from db.models import get_session
from db import crud
from passlib.context import CryptContext
import uuid, os, jwt
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change")
JWT_EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MIN", "1440"))

class SignupBody(BaseModel):
    email: EmailStr
    password: str
    display_name: str | None = None

class LoginBody(BaseModel):
    email: EmailStr
    password: str

class ProfileOut(BaseModel):
    id: str
    email: EmailStr
    display_name: str | None
    created_at: datetime

def create_token(user_id: str):
    exp = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MIN)
    return jwt.encode({"sub": user_id, "exp": exp}, JWT_SECRET, algorithm="HS256")

def verify_token(token: str) -> str:
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return data["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def auth_user(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ",1)[1]
    return verify_token(token)

@router.post('/signup')
def signup(body: SignupBody):
    with get_session() as session:
        if crud.get_user_by_email(session, body.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        user_id = str(uuid.uuid4())
        pwd_hash = pwd_ctx.hash(body.password)
        user = crud.create_user_with_password(session, user_id, body.email, pwd_hash, body.display_name)
        token = create_token(user.id)
        return {"status":"success","token":token,"user":ProfileOut(id=user.id,email=user.email,display_name=user.display_name,created_at=user.created_at)}

@router.post('/login')
def login(body: LoginBody):
    with get_session() as session:
        user = crud.get_user_by_email(session, body.email)
        if not user or not user.password_hash or not pwd_ctx.verify(body.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_token(user.id)
        return {"status":"success","token":token,"user":ProfileOut(id=user.id,email=user.email,display_name=user.display_name,created_at=user.created_at)}

@router.get('/me')
def me(user_id: str = Depends(auth_user)):
    with get_session() as session:
        user = session.get(crud.User, user_id)  # type: ignore
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status":"success","user":ProfileOut(id=user.id,email=user.email,display_name=user.display_name,created_at=user.created_at)}

# Gallery Endpoints (video assets)
class VideoAssetIn(BaseModel):
    id: str | None = None
    title: str
    path: str
    thumbnail: str | None = None
    duration_sec: int | None = None
    job_id: str | None = None
    meta: dict | None = None

@router.post('/gallery')
def add_video_asset(body: VideoAssetIn, user_id: str = Depends(auth_user)):
    with get_session() as session:
        asset_id = body.id or str(uuid.uuid4())
        asset = crud.add_video_asset(session, asset_id, user_id, body.title, body.path, body.thumbnail, body.duration_sec, body.meta, body.job_id)
        return {"status":"success","asset": {
            "id": asset.id, "title": asset.title, "path": asset.path, "thumbnail": asset.thumbnail, "duration_sec": asset.duration_sec, "created_at": asset.created_at.isoformat()
        }}

@router.get('/gallery')
def list_gallery(user_id: str = Depends(auth_user)):
    with get_session() as session:
        assets = crud.list_video_assets(session, user_id)
        return {"status":"success","assets":[{"id":a.id,"title":a.title,"path":a.path,"thumbnail":a.thumbnail,"duration_sec":a.duration_sec,"created_at":a.created_at.isoformat()} for a in assets]}

@router.delete('/gallery/{asset_id}')
def delete_asset(asset_id: str, user_id: str = Depends(auth_user)):
    with get_session() as session:
        ok = crud.delete_video_asset(session, user_id, asset_id)
        if not ok:
            raise HTTPException(status_code=404, detail="Not found")
        return {"status":"success"}
