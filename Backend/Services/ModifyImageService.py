import base64
import os
import mimetypes
from google import genai
from google.genai import types
from Config.settings import settings

def save_binary_file(file_name, data):
    """Save binary data to a file."""
    with open(file_name, "wb") as f:
        f.write(data)

def ModifyImageService(input_image_path, prompt):
    """
    Generate a modified image based on an input image and a text prompt, overwriting the original image.
    
    Args:
        input_image_path (str): Path to the input image file.
        prompt (str): Text prompt describing the desired modification.
    
    Returns:
        str or None: Path to the modified image file (same as input_image_path), or None if no image is generated.
    """
    # Resolve API key via (env -> settings loader) chain
    api_key = os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY for image modification. Set it in environment or .env file.")
    client = genai.Client(api_key=api_key)

    # Specify the model
    model = "gemini-2.0-flash-exp-image-generation"

    # Read the input image and determine its MIME type
    with open(input_image_path, "rb") as f:
        image_data = f.read()
    mime_type = mimetypes.guess_type(input_image_path)[0] or "image/jpeg"
    
    # Create content parts: text prompt and image
    text_part = types.Part.from_text(text=prompt)
    image_part = types.Part(inline_data=types.Blob(data=image_data, mime_type=mime_type))
    contents = [
        types.Content(
            role="user",
            parts=[text_part, image_part],
        ),
    ]

    # Configure the generation settings
    generate_content_config = types.GenerateContentConfig(
        response_modalities=["image", "text"],
        response_mime_type="text/plain",
    )

    # Variable to store the path of the modified image
    modified_image_path = None

    # Process the streaming response
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
            continue
        part = chunk.candidates[0].content.parts[0]
        if hasattr(part, "inline_data") and part.inline_data:
            # Save the generated image, overwriting the original file
            inline_data = part.inline_data
            file_name = input_image_path  # Use the original path to overwrite
            save_binary_file(file_name, inline_data.data)
            modified_image_path = file_name
            print(f"Original image replaced with modified image at: {file_name}")
        else:
            # Print any text response
            print(chunk.text)

    return modified_image_path

# if __name__ == "__main__":
#     # Example usage
#     input_image_path = "D:/AI_AGENT_FOR_YOUTUBE/YoutubeVideoGen/assets/images/image_9.png"  # Replace with your image path
#     prompt = "Modify the image that 3 chefs are cooking in a kitchen"  # Replace with your prompt
#     modified_image_path = generate(input_image_path, prompt)
#     if modified_image_path:
#         print(f"Modified image is at: {modified_image_path}")
#     else:
#         print("No image was generated.")