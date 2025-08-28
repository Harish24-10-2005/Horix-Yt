import base64
import os
import mimetypes
import json
import logging
import sys
import traceback
from datetime import datetime
from google import genai
from google.genai import types

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("gemini_generation.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def save_binary_file(file_name, data):
    """Save binary data to a file with error handling."""
    try:
        with open(file_name, "wb") as f:
            f.write(data)
        logger.info(f"Successfully saved file to: {file_name}")
        return True
    except IOError as e:
        logger.error(f"Failed to save file {file_name}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error saving file {file_name}: {e}")
        return False

def generate():
    """Generate a sequence of images showing how to make a boat from waste paper."""
    logger.info("Starting image generation process")
    
    # Initialize the Gemini API client with your API key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable not set")
        return
    
    try:
        client = genai.Client(api_key=api_key)
        logger.info("Successfully initialized Gemini client")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        return
    
    # Specify the model and content prompt
    model = "gemini-2.0-flash-exp-image-generation"
    prompt = "Generate a sequence of images and steps to make waste paper to boat"
    logger.info(f"Using model: {model}")
    logger.info(f"Prompt: {prompt}")
    
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        ),
    ]

    # Configure the response to allow both images and text
    generate_content_config = types.GenerateContentConfig(
        response_modalities=["image", "text"],
    )

    # Create a directory to save images with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    directory = f"generated_images_{timestamp}"
    try:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Created directory: {directory}")
    except Exception as e:
        logger.error(f"Failed to create directory {directory}: {e}")
        return
    
    image_count = 0  # Counter for unique image filenames
    step_descriptions = []  # Store step descriptions for summary

    # First try with streaming API
    logger.info("Attempting to generate content using streaming API")
    try:
        stream_response = client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        )
        
        for chunk_index, chunk in enumerate(stream_response):
            # Skip chunks without candidates or content
            if not chunk.candidates or not chunk.candidates[0].content:
                logger.debug(f"Skipping empty chunk {chunk_index}")
                continue
            
            logger.info(f"Processing chunk {chunk_index}")
            content = chunk.candidates[0].content
            
            # Process all parts in the content
            for part_index, part in enumerate(content.parts):
                try:
                    if part.inline_data:
                        # Handle image data
                        inline_data = part.inline_data
                        file_name = f"{directory}/image_{image_count}"
                        file_extension = mimetypes.guess_extension(inline_data.mime_type) or ".bin"
                        full_path = f"{file_name}{file_extension}"
                        
                        if save_binary_file(full_path, inline_data.data):
                            logger.info(f"File of mime type {inline_data.mime_type} saved to: {full_path}")
                            image_count += 1
                        
                    elif part.text:
                        # Handle text descriptions
                        step_text = part.text.strip()
                        step_descriptions.append(step_text)
                        logger.info(f"Step {image_count + 1} description: {step_text}")
                        
                except Exception as e:
                    logger.error(f"Error processing part {part_index} in chunk {chunk_index}: {e}")
                    logger.error(traceback.format_exc())
        
        logger.info("Successfully completed streaming generation")
        
    except json.decoder.JSONDecodeError as e:
        logger.warning(f"JSON decode error with streaming API: {e}")
        logger.info("Falling back to non-streaming API")
        
        # Fallback to non-streaming API
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=generate_content_config,
            )
            
            if response.candidates:
                content = response.candidates[0].content
                logger.info(f"Non-streaming API returned {len(content.parts)} parts")
                
                for part_index, part in enumerate(content.parts):
                    try:
                        if part.inline_data:
                            inline_data = part.inline_data
                            file_name = f"{directory}/image_{image_count}"
                            file_extension = mimetypes.guess_extension(inline_data.mime_type) or ".bin"
                            full_path = f"{file_name}{file_extension}"
                            
                            if save_binary_file(full_path, inline_data.data):
                                logger.info(f"File of mime type {inline_data.mime_type} saved to: {full_path}")
                                image_count += 1
                                
                        elif part.text:
                            step_text = part.text.strip()
                            step_descriptions.append(step_text)
                            logger.info(f"Step {image_count} description: {step_text}")
                            
                    except Exception as e:
                        logger.error(f"Error processing part {part_index} from non-streaming response: {e}")
                        logger.error(traceback.format_exc())
            else:
                logger.warning("Non-streaming API returned no candidates")
                
        except Exception as e:
            logger.error(f"Error with non-streaming API: {e}")
            logger.error(traceback.format_exc())
            
    except Exception as e:
        logger.error(f"Unexpected error during generation: {e}")
        logger.error(traceback.format_exc())

    # Generate a summary file
    try:
        if step_descriptions:
            summary_path = f"{directory}/summary.txt"
            with open(summary_path, "w") as f:
                f.write(f"How to make a boat from waste paper - Generated on {timestamp}\n\n")
                for i, desc in enumerate(step_descriptions):
                    f.write(f"Step {i+1}: {desc}\n\n")
            logger.info(f"Generated summary file at {summary_path}")
        
        logger.info(f"Generation complete. Total images saved: {image_count}")
    except Exception as e:
        logger.error(f"Failed to write summary file: {e}")

if __name__ == "__main__":
    logger.info("Script started")
    try:
        generate()
    except Exception as e:
        logger.error(f"Critical error in main execution: {e}")
        logger.error(traceback.format_exc())
    logger.info("Script finished")