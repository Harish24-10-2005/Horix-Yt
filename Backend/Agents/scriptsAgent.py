import json
import os
from dotenv import load_dotenv
from Agents.contentAgent import ContentAgent
from Config.LLMs.Gemini.gemini_2_0_flash_thinking_exp_01_21 import GeminiLLM
from Agents.Prompts.Content import *
import re 
class ScriptAgent:
    def __init__(self, **kwargs):
        """
        Initialize the Content Agent with OpenRouter client and content prompt.
        """
        self.LLM = GeminiLLM("")

        
    def generate_Scripts_Gemini(self, content: str,video_mode: bool = False, model: str = None) -> str:
        if video_mode:
            prompt = YT_SCRIPT_PROMPT
        else:
            prompt = YT_SHORTS_SCRIPT_PROMPT
        fullPrompt = prompt.replace("{content}", content)
        response = self.LLM._call(fullPrompt)
        return response

# if __name__ == "__main__":
#     content_agent = ContentAgent()
#     script_agent = ScriptAgent()
#     title = "tutorial for makeing mutton sukka step by step tutorial and best tastey with ingredients quantity also"
#     generated_content = content_agent.generate_content(title,video_mode=True,channelType="Food tutorial")
#     script = script_agent.generate_Scripts_Gemini(generated_content,video_mode=True)
#     # print(script)
#     pattern = re.compile(r"```json\s*(\{.*?\})\s*```", re.DOTALL)
#     match = pattern.search(script)

#     if match:
#         json_str = match.group(1)
#         try:
#             data = json.loads(json_str)
#             print("Parsed JSON:")
#             print(json.dumps(data, indent=4))
#         except json.JSONDecodeError as e:
#             print("Error decoding JSON:", e)
#     else:
#         print("No JSON block found in the provided string.")
    
#     voice_scripts = data.get("voice_scripts", [])
#     image_prompts = data.get("image_prompts", [])
#     print(len(voice_scripts))
#     print("=============================================")
#     print(len(image_prompts))