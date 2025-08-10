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
   
    def generate_content(self, title: str,video_mode: bool = False,channelType: str = None, model: str = None) -> str:
        if video_mode:
            self.prompt = VIDEO_PROMPT
        else:
            self.prompt = YT_SHORTS_PROMPT
        
        formatted_messages = self.prompt.replace("{title}", title)
        final = formatted_messages.replace("{channelType}", channelType)
        # print(final)
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