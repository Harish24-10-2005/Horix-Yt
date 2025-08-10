import os
import gc
import logging
import time
from typing import List, Dict, Optional
# Lazy torch import to reduce startup cost (only needed for cuda detection / potential future use)
_torch = None
def _lazy_torch():
    global _torch
    if _torch is None:
        try:
            import torch  # type: ignore
            _torch = torch
        except Exception:
            _torch = None
    return _torch
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv
import wave
import struct
import math

class VoiceGenerator:
    def __init__(self, 
                Voices = "Arista-PlayAI",
                output_folder: str = "assets/VoiceScripts",
                device: str | None = None):
        """
        Initialize a voice generator using the Groq API with key rotation to handle rate limits.
        
        Args:
            Voices: Default voice to use for generation.
            output_folder: Directory to save generated voice files.
            device: Device for any local processing ('cuda' or 'cpu').
        """
        self.output_folder = output_folder
        # Decide device lazily unless explicitly provided
        if device:
            self.device = device
        else:
            disable_torch = os.getenv("VOICEGEN_DISABLE_TORCH")
            t = None if disable_torch else _lazy_torch()
            if t is not None and getattr(t.cuda, 'is_available', lambda: False)():
                self.device = "cuda"
            else:
                self.device = "cpu"
        self.logger = logging.getLogger(__name__)
        
        # Set up logging
        logging.basicConfig(level=logging.INFO)
        
        try:
            os.makedirs(self.output_folder, exist_ok=True)
            self._clear_memory()
            
            self.logger.info(f"Initializing Groq client for TTS")
            load_dotenv()
            
            # Load multiple API keys (GROQ_API_KEY1..3) or fallback to GROQ_API_KEY
            self.api_keys = []
            for i in range(1, 4):  # Try keys 1-3
                key = os.getenv(f"GROQ_API_KEY{i}")
                if key:
                    self.api_keys.append(key)

            single_key = os.getenv("GROQ_API_KEY")
            if not self.api_keys and single_key:
                self.api_keys.append(single_key)

            self.dry_run = False
            if not self.api_keys:
                if os.getenv("VOICEGEN_DRY_RUN"):
                    self.dry_run = True
                    self.logger.warning("No Groq API keys found. VOICEGEN_DRY_RUN enabled: generating silent placeholder audio.")
                else:
                    raise ValueError("No Groq API keys found in environment variables (set GROQ_API_KEY or GROQ_API_KEY1..3 or enable VOICEGEN_DRY_RUN=1)")
                
            self.logger.info(f"Loaded {len(self.api_keys)} API keys")
            self.current_key_index = 0
            
            # Initialize the client with the first key if not dry-run
            if not self.dry_run:
                self.client = Groq(api_key=self.api_keys[self.current_key_index])
            
            # Set default voice
            self.default_voice = Voices if Voices else "Arista-PlayAI"
            self.logger.info(f"Default voice set to: {self.default_voice}")
            
            # List of available voices for PlayAI TTS
            self.available_voices = [
                "Arista-PlayAI", "Atlas-PlayAI", "Basil-PlayAI", "Briggs-PlayAI",
                "Calum-PlayAI", "Celeste-PlayAI", "Cheyenne-PlayAI", "Chip-PlayAI",
                "Cillian-PlayAI", "Deedee-PlayAI", "Fritz-PlayAI", "Gail-PlayAI",
                "Indigo-PlayAI", "Mamaw-PlayAI", "Mason-PlayAI", "Mikail-PlayAI",
                "Mitch-PlayAI", "Quinn-PlayAI", "Thunder-PlayAI"
            ]

            
        except Exception as e:
            self.logger.error(f"Error initializing VoiceGenerator: {str(e)}")
            raise
    
    def _clear_memory(self):
        """Clear CUDA memory if using GPU."""
        if self.device == "cuda":
            t = _lazy_torch()
            if t is not None:
                try:
                    t.cuda.empty_cache()
                except Exception:
                    pass
            gc.collect()
    
    def _rotate_api_key(self):
        """Rotate to the next available API key."""
        if len(self.api_keys) <= 1:
            self.logger.warning("Only one API key available, cannot rotate")
            return False
            
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        self.client = Groq(api_key=self.api_keys[self.current_key_index])
        self.logger.info(f"Rotated to API key {self.current_key_index + 1}")
        return True
    
    def _write_silence_wav(self, path: str, duration_sec: float = 2.0, sample_rate: int = 22050):
        """Create a simple silent WAV file (or low-amplitude tone) for dry-run mode."""
        n_samples = int(duration_sec * sample_rate)
        with wave.open(path, 'w') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(sample_rate)
            for i in range(n_samples):
                # faint low-frequency tone to differentiate from pure silence
                val = int(3000 * math.sin(2 * math.pi * 220 * (i / sample_rate))) if i < sample_rate else 0
                wf.writeframes(struct.pack('<h', val))

    def generate_voice(self, 
                   sentence: str, 
                   filename: str = "output.wav",
                   voice: str = None,
                   speed: float = 0.2,
                   split_sentences: bool = True,
                   max_retries: int = 3) -> Optional[str]:
        """
        Generate a voice file from text with automatic API key rotation on rate limits.
        
        Args:
            sentence: Text to convert to speech.
            filename: Output filename.
            voice: Voice ID to use (overrides default).
            speed: Speed factor (not used in Groq API but kept for compatibility).
            split_sentences: Enable sentence splitting (not used in Groq API but kept for compatibility).
            max_retries: Maximum number of retry attempts with different API keys.
            
        Returns:
            Path to the generated audio file, or None if generation failed.
        """
        if not sentence:
            raise ValueError("Empty text provided")
            
        filepath = os.path.join(self.output_folder, filename)
        
        # Dry-run shortcut
        if self.dry_run:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            self._write_silence_wav(filepath, duration_sec=max(2, len(sentence.split())/3))
            self.logger.info(f"[DRY-RUN] Generated placeholder audio at {filepath}")
            return filepath

        retries = 0
        while retries <= max_retries:
            try:
                self._clear_memory()
                self.logger.info(f"Generating voice for text: {sentence[:50]}...")
                
                selected_voice = voice if voice else self.default_voice
                if selected_voice not in self.available_voices:
                    self.logger.warning(f"Voice {selected_voice} is not available. Falling back to Arista-PlayAI")
                    selected_voice = "Arista-PlayAI"
                    
                self.logger.info(f"Using voice: {selected_voice} with API key {self.current_key_index + 1}")
        
                try:
                    response = self.client.audio.speech.create(
                        model="playai-tts",
                        voice=selected_voice,
                        input=sentence,
                        response_format="wav"
                    )
                    
                    os.makedirs(os.path.dirname(filepath), exist_ok=True)
                    with open(filepath, "wb") as f:
                        f.write(response.read()) 
                    
                    self.logger.info(f"Voice generated successfully at: {filepath}")
                    return filepath
                    
                except Exception as api_error:
                    error_msg = str(api_error)
                    if "requires terms acceptance" in error_msg.lower():
                        self.logger.error("The PlayAI TTS model requires terms acceptance. Please have the organization admin accept the terms at https://console.groq.com/playground?model=playai-tts")
                        raise RuntimeError("PlayAI TTS model requires terms acceptance. Visit Groq console to accept terms.")
                    elif "rate limit" in error_msg.lower() or "too many requests" in error_msg.lower():
                        if self._rotate_api_key():
                            self.logger.warning(f"Rate limit hit. Rotated to next API key. Retry {retries + 1}/{max_retries}")
                            retries += 1
                            time.sleep(2)  # Add a small delay between retries
                            continue
                        else:
                            self.logger.error("Rate limit hit but unable to rotate API keys.")
                            raise
                    else:
                        raise
                
            except Exception as e:
                if retries < max_retries and self._rotate_api_key():
                    self.logger.warning(f"Error: {str(e)}. Trying with next API key. Retry {retries + 1}/{max_retries}")
                    retries += 1
                    time.sleep(2)  # Add a small delay between retries
                    continue
                else:
                    self.logger.error(f"All API keys failed. Error generating voice: {str(e)}")
                    return None
            finally:
                self._clear_memory()
                
        self.logger.error(f"Failed after {max_retries} retries with different API keys")
        return None

    # ---------------- New helper methods ----------------
    def get_available_voices(self) -> List[str]:
        """Return list of supported voice IDs."""
        return list(self.available_voices)

    def validate_voice(self, voice: Optional[str]) -> str:
        """Validate a requested voice; return a safe voice ID or raise.

        If voice is None returns default. If invalid, raises ValueError with list of allowed voices.
        """
        if not voice:
            return self.default_voice
        if voice not in self.available_voices:
            raise ValueError(f"Invalid voice '{voice}'. Allowed: {', '.join(self.available_voices)}")
        return voice
            
    def generate_multiple_voices(self, 
                                 sentences: List[str], 
                                 base_filename: str = "voicescript",
                                 voice: str = None,
                                 speed: float = 0.2,
                                 split_sentences: bool = True) -> Dict[str, str]:
        """
        Generate voice files for multiple sentences with sequential naming.
        
        Args:
            sentences: List of sentences to convert to speech.
            base_filename: Base name for output files (appended with sequential numbers).
            voice: Voice ID to use (defaults to the channel's default voice).
            speed: Speed factor for the synthesized speech. (Note: not used in Groq API but kept for compatibility)
            split_sentences: Enable sentence splitting for natural pauses. (Note: not used in Groq API but kept for compatibility)
            
        Returns:
            Dictionary mapping each sentence to its output filepath.
        """
        results = {}
        
        for i, sentence in enumerate(sentences, 1):
            filename = f"{base_filename}{i}.wav"
            
            try:
                filepath = self.generate_voice(
                    sentence,
                    filename,
                    voice=voice,
                    speed=speed,
                    split_sentences=split_sentences
                )
                if filepath:
                    results[sentence] = filepath
                else:
                    self.logger.warning(f"Failed to generate voice for sentence {i}")
                    
            except Exception as e:
                self.logger.error(f"Error processing sentence {i}: {str(e)}")
                continue
                
        return results

# Example usage:
# if __name__ == "__main__":
#     try:
#         # Load environment variables from .env file
#         load_dotenv()
        
#         # Check if any API keys are available
#         api_keys_found = False
#         for i in range(1, 4):
#             if os.getenv(f"GROQ_API_KEY{i}"):
#                 api_keys_found = True
#                 break
                
#         if not api_keys_found:
#             print("Warning: No GROQ_API_KEY environment variables found. Add them to your .env file.")
#             print("Format: GROQ_API_KEY1=key1, GROQ_API_KEY2=key2, GROQ_API_KEY3=key3")
            
#         # Initialize generator
#         generator = VoiceGenerator()
        
#         # Example list of sentences
#         sentences = [
#             "Yo, Ben 10 fans! Omniverse dropped a WILD alien roster, some epic, some… questionable! Forget the filler, we're hitting you with pure POWER. Get ready for the ULTIMATE Omniverse alien TOP 5 countdown, right here, right now!",
#             "Kicking off at FIVE, it's Bloxx! Lego dude? Yeah, but don't sleep on him! Versatile transformations, brick-brawl pain train, and endlessly rebuildable. Then RAMPAGING in at FOUR, it's RATH! Pure, hilarious fury, wrestling moves, and classic rants. Cracking top THREE, energy sponge supreme, FEEDBACK! OG Omniverse awesome, adaptable power, fan-favorite for a reason. Almost THERE!",
#             "Number TWO, gravity GOD, Gravattack! Planetoid power, crushing force, black hole potential, a true heavy hitter. AND FINALLY, the champ, the nuclear NIGHTMARE, ATOMIX! Ridiculously OP, devastating blasts, UNIMAGINABLE power. Agree with the list? Who's YOUR top alien? Smash like, subscribe, and tell us in the comments! Peace out!"

#         ]
        
#         # Generate voices for all sentences
#         results = generator.generate_multiple_voices(sentences)
        
#         # Print results
#         for sentence, filepath in results.items():
#             print(f"\nSentence: {sentence}")
#             print(f"Generated file: {filepath}")
            
#     except Exception as e:
#         print(f"Error in main: {str(e)}")