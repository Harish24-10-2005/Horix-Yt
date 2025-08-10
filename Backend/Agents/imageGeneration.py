import os
import time
from queue import Queue
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64

class ImageGenerator:
    def __init__(self, api_key, model="gemini-2.0-flash-exp-image-generation", 
                 width=1920, height=1080, output_dir="assets/images", video_mode: bool = False):
        """
        Initialize the ImageGenerator with a Google API key and configuration options.
        
        Args:
            api_key (str): Google Generative AI API key.
            model (str): Model name, defaults to "gemini-2.0-flash-exp-image-generation".
            width (int): Target width of output images.
            height (int): Target height of output images.
            output_dir (str): Directory to save generated images.
        """
        self.api_key = api_key
        self.model = model
        # Swap orientation for shorts vs full video
        if video_mode:
            # Landscape (standard YouTube)
            self.width, self.height = 1920, 1080
        else:
            # Portrait (Shorts)
            self.width, self.height = 1080, 1920
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.client = genai.Client(api_key=api_key)

    def generate_image_with_retry(self, prompt, idx, max_retries=5):
        """
        Generate an image for a given prompt with retry logic for error handling.
        
        Args:
            prompt (str): Text prompt to generate the image.
            idx (int): Index for naming the output file (e.g., image_1.png).
            max_retries (int): Maximum number of retry attempts.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        for retry in range(max_retries):
            try:
                print(f"Generating image {idx} using Google Generative AI")
                print(f"Prompt: {prompt}")
                
                # Request image generation using the client approach
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_modalities=['Text', 'Image']
                    )
                )
                
                # Process the response
                image_saved = False
                for part in response.candidates[0].content.parts:
                    if part.text is not None:
                        print(f"Text response: {part.text[:100]}...")
                    elif part.inline_data is not None:
                        try:
                            # Process and save the image
                            image = Image.open(BytesIO(part.inline_data.data))
                            
                            # Resize to desired dimensions
                            image = image.resize((self.width, self.height))
                            
                            # Save as PNG
                            output_path = os.path.join(self.output_dir, f"image_{idx}.png")
                            image.save(output_path, format="PNG")
                            print(f"Saved image {idx} ({self.width}x{self.height}) to {output_path}")
                            image_saved = True
                            return True
                        except Exception as e:
                            print(f"Error processing image {idx}: {str(e)}")
                
                if not image_saved:
                    print(f"No image data found in response for prompt {idx}")
                    time.sleep(10)
            
            except Exception as e:
                print(f"Error generating image {idx} (attempt {retry+1}/{max_retries}): {str(e)}")
                if "rate limit" in str(e).lower():
                    time.sleep(60)  # Wait longer for rate limit errors
                else:
                    time.sleep(10)
        
        print(f"Failed to generate image {idx} after {max_retries} attempts")
        return False

    def generate_all_images(self, prompts):
        """
        Process all prompts to generate images, handling failures by re-queueing.
        
        Args:
            prompts (list): List of text prompts to generate images for.
        """
        queue = Queue()
        for idx, prompt in enumerate(prompts, 1):
            queue.put((idx, prompt))

        while not queue.empty():
            idx, prompt = queue.get()
            success = self.generate_image_with_retry(prompt, idx)
            if not success:
                queue.put((idx, prompt))  # Re-add failed item to queue
                time.sleep(60)  # Wait before retrying

# if __name__ == "__main__":
#     api_key = os.getenv("GEMINI_API_KEY")
#     if not api_key:
#         api_key = "AIzaSyBPatOrjfAfad-ivzVLCqdqqkSYJTZp9yw"  # Note: Consider using your own API key
    
#     # Example prompts
#     prompts = [
#          "Close-up shot of a hand dramatically wiping away text from a cookbook titled 'Mutton Sukka Recipes', revealing a blank page beneath, symbolizing a fresh start.",
#         "Cinematic view of a spice market overflowing with vibrant colors and exotic spices, shot from a low angle looking up, emphasizing abundance and forgotten flavors.",
#         "Abstract image of a question mark formed by swirling steam rising from a pot of cooking mutton sukka, against a dark, mysterious background.",
#         "Monochrome image of a dry, cracked desert landscape, with a single plate of bland, unappetizing Mutton Sukka in the foreground, symbolizing culinary disappointment.",
#         "Surreal visual of a person biting into Mutton Sukka, their face contorted in displeasure, with storm clouds gathering in the background, representing a culinary storm.",
#         "Close-up, fast-motion shot of hands meticulously arranging spices in perfect order, like a surgeon preparing for an operation, symbolizing precision and mastery in cooking.",
#         "Abstract digital art depicting fragmented recipe instructions dissolving into dust, with sparks of flavor and vibrant colors emerging from the disintegration.",
#         "Golden key dramatically unlocking an ornate chest overflowing with spices and aromatic herbs, in a dimly lit, ancient kitchen setting, symbolizing the unlocking of culinary secrets.",
#         "High-contrast image of a culinary apprentice looking up at a seasoned chef with awe and determination, in a dynamic kitchen environment, representing the journey from ordinary to extraordinary.",
#         "Split screen image: one side shows robotic hands mechanically following a recipe, the other side shows human hands intuitively cooking with passion and flair, highlighting the difference between instruction and intuition.",
#         "Visual metaphor of spices being roasted in a pan, flames licking around them, transforming into glowing embers, symbolizing the aromatic awakening of spices.",
#         "Image of a chef's hands gently cradling a piece of raw mutton, examining its quality with expert eyes, in soft, natural light, emphasizing the importance of ingredient quality.",
#         "Slow-motion shot of spice particles swirling and layering on a piece of mutton, creating a vibrant and complex texture, symbolizing the art of spice layering.",
#         "Close-up of steam escaping from a pot of simmering Mutton Sukka, shot with shallow depth of field, creating a mysterious and inviting atmosphere, hinting at hidden flavors.",
#         "Visual representation of 'slow cooking' \u2013 time-lapse shot of mutton slowly tenderizing in a pot, with light and shadow playing across the scene, emphasizing patience and transformation.",
#         "Detailed ingredient shot: 500 grams of fresh, red mutton cubes, glistening with moisture, arranged artfully on a butcher block, showcasing quality ingredients.",
#         "Close-up of whole coriander seeds, cumin seeds, and black peppercorns, arranged in a visually appealing pattern, highlighting the beauty and importance of whole spices.",
#         "Dramatic lighting on a mortar and pestle grinding whole spices into a coarse powder, with spice dust swirling in the air, emphasizing the freshness of freshly ground spices.",
#         "Sizzling curry leaves and green chilies splattering in hot oil, captured with a high-speed camera, vibrant colors and dynamic action, showcasing the aromatic base.",
#         "Onions caramelizing to golden brown in a pan, close-up shot, rich golden hues and glistening texture, emphasizing the foundation of flavor.",
#         "Marinated mutton pieces being added to a pan with sizzling aromatics, dynamic shot with steam and motion blur, capturing the cooking process in action.",    
#         "Ground spice powder being sprinkled over saut\u00e9ed mutton, like gold dust falling onto a precious dish, highlighting the value of the spice blend.",      
#         "Mutton simmering in a pan, covered with a lid, soft focus and gentle lighting, creating a sense of anticipation and slow transformation.",
#         "Close-up of Mutton Sukka being dry roasted, spices clinging to the mutton, caramelization happening before your eyes, intense heat and dynamic textures.",   
#         "Final shot of perfectly roasted Mutton Sukka, spices beautifully coating the meat, glistening and caramelized, ready to be served, mouthwatering and inviting.",
#         "Artistic shot of Mutton Sukka garnished with fresh coriander leaves, vibrant green against the rich brown of the dish, adding a touch of freshness and visual appeal.",
#         "A plate of Mutton Sukka served on a rustic wooden table, inviting and warm lighting, creating a sense of home-cooked goodness and culinary satisfaction.",   
#         "Metaphorical image of a taste journey \u2013 a winding road leading to a mountain peak labeled 'Ultimate Mutton Sukka', with spices and ingredients scattered along the path.",
#         "Hands experimenting with spices, mixing and matching, in a brightly lit kitchen laboratory setting, symbolizing culinary innovation and experimentation.",   
#         "Abstract artwork representing culinary self-improvement \u2013 evolving shapes and colors transforming into a perfect plate of Mutton Sukka, symbolizing growth and mastery."
#     ]
    
#     # Initialize and run the generator
    
#     generator = ImageGenerator(api_key, video_mode=True)
#     generator.generate_all_images(prompts)