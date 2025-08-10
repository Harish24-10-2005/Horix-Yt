from Controller.Controller import VideoGenerationController
from jobs.job_utils import load_manifest

async def main():
    c = VideoGenerationController()
    res = await c.generate_content("Test Title", video_mode=False, channel_type="general")
    job_id = res.get("job_id")
    print("Content result:", res)
    res2 = await c.generate_scripts("Test Title", content=res.get("content"), video_mode=False, channel_type="general", job_id=job_id)
    print("Scripts result keys:", list(res2.keys()))
    manifest = load_manifest(job_id)
    print("Manifest stages so far:", manifest.get("stages"))

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
