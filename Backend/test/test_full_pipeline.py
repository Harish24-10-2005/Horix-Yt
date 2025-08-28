import asyncio
from Controller.Controller import VideoGenerationController

async def main():
    c = VideoGenerationController()
    result = await c.generate_full_pipeline(title="Pipeline Demo", channel_type="general", voice=None, video_mode=False, quick=True)
    print("Pipeline status:", result.get('status'))
    print("Stages in manifest:", list(result['manifest']['stages'].keys()))
    print("Completion status:", result['manifest']['status'])

if __name__ == '__main__':
    asyncio.run(main())
