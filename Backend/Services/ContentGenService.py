from Agents.contentAgent import ContentAgent

def ContentGenService(title: str, video_mode: bool = False, channelType: str = None):
    """Generate high-level content text.

    Previously the function hard-coded video_mode=True, breaking shorts mode logic.
    Now it respects the caller-provided flag.
    """
    content_agent = ContentAgent()
    generated_content = content_agent.generate_content(title, video_mode=video_mode, channelType=channelType)
    return generated_content

