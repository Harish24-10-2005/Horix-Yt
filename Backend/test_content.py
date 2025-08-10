from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
resp = client.post('/api/video/content', json={'title':'Diagnose error','video_mode':True,'channel_type':'Tech'})
print('STATUS', resp.status_code)
print('BODY', resp.text[:500])
