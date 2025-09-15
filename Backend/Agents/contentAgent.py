import json
import os
import google.generativeai as genai
from  Config.LLMs.Gemini.gemini_2_0_flash_thinking_exp_01_21 import GeminiLLM
from Agents.Prompts.Content import *

class ContentAgent:
    def __init__(self, **kwargs):
        """Initialize the Content Agent with Gemini model wrapper."""
        # Do not pass literal placeholder; let GeminiLLM resolve env/settings
        self.LLM = GeminiLLM(None)
   
    def generate_content(self, title: str, video_mode: bool = False, channelType: str = None, model: str = None) -> str:
        """Generate content with safe placeholder substitution.

        channelType can be optional from the client; previously passing None
        caused: TypeError: replace() argument 2 must be str, not None.
        We now coerce None/empty to a benign default ("general") so prompt
        templates always receive a string.
        """
        if video_mode:
            self.prompt = VIDEO_PROMPT
        else:
            self.prompt = YT_SHORTS_PROMPT

        safe_channel = channelType if isinstance(channelType, str) and channelType.strip() else "general"
        formatted = self.prompt.replace("{title}", title or "Untitled")
        final = formatted.replace("{channelType}", safe_channel)
        try:
            response = self.LLM._call(final)
        except Exception as e:
            return f"[Error generating content: {e}]"
        return response

# if __name__ == "__main__":
#     content_agent = ContentAgent()
#     title = "stepby step guide to creating a mutton sukka"
#     generated_content = content_agent.generate_content(title,video_mode=True,channelType="Food tutorial")
#     print(generated_content)