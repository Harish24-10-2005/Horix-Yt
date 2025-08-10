import os
import torch
import gc
import logging
from typing import List, Dict, Optional, Union
from pathlib import Path
try:
    from TTS.api import TTS  # type: ignore
except ImportError:  # defer error until actually needed
    TTS = None  # type: ignore

class ClonedVoiceGenerator:
    """Voice cloning generator using Coqui XTTS (multilingual) model.

    Supports providing either a single reference audio file (wav/mp3) or a directory
    containing multiple reference audio files to improve speaker embedding robustness.
    """

    SUPPORTED_EXT = {".wav", ".mp3", ".flac", ".ogg", ".m4a"}

    def __init__(self,
                 speaker_source: Union[str, Path],
                 output_folder: str = "assets/VoiceScripts",
                 device: str = "cuda" if torch.cuda.is_available() else "cpu",
                 model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2",
                 language: str = "en"):
        self.output_folder = output_folder
        self.device = device
        self.language = language
        self.model_name = model_name
        self.logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)
        self._clear_memory()
        os.makedirs(self.output_folder, exist_ok=True)

        # Resolve reference audio list
        self.reference_files = self._collect_reference_files(Path(speaker_source))
        if not self.reference_files:
            raise ValueError(f"No valid reference audio found at {speaker_source}")

        if TTS is None:
            raise RuntimeError("Coqui TTS library not installed. Install 'TTS' package to enable cloning.")
        self.logger.info(f"Loading XTTS model {model_name} on {device} (refs={len(self.reference_files)})")
        try:
            self.tts = TTS(model_name).to(device)  # type: ignore
        except Exception as e:
            raise RuntimeError(f"Failed to load TTS model {model_name}: {e}")

    def _collect_reference_files(self, source: Path) -> List[str]:
        if source.is_file():
            return [str(source)] if source.suffix.lower() in self.SUPPORTED_EXT else []
        if source.is_dir():
            files = [str(p) for p in source.iterdir() if p.suffix.lower() in self.SUPPORTED_EXT]
            return sorted(files)
        return []

    def _clear_memory(self):
        """Clear CUDA memory if using GPU."""
        if self.device == "cuda":
            torch.cuda.empty_cache()
            gc.collect()

    def generate_voice(self,
                       sentence: str,
                       filename: str = "output.wav",
                       split_sentences: bool = True) -> Optional[str]:
        if not sentence:
            raise ValueError("Empty text provided")
        filepath = os.path.join(self.output_folder, filename)
        try:
            self._clear_memory()
            self.logger.info(f"[CLONE] Generating voice for: {sentence[:60]} ...")
            try:
                self.tts.tts_to_file(
                    text=sentence,
                    speaker_wav=self.reference_files if len(self.reference_files) == 1 else self.reference_files,
                    language=self.language,
                    file_path=filepath,
                    split_sentences=split_sentences
                )
            except Exception:
                self.tts.tts_to_file(
                    text=sentence,
                    speaker_wav=self.reference_files[0],
                    language=self.language,
                    file_path=filepath,
                    split_sentences=split_sentences
                )
            self.logger.info(f"[CLONE] Saved: {filepath}")
            return filepath
        except Exception as e:
            self.logger.error(f"Clone error: {e}")
            return None
        finally:
            self._clear_memory()

    def generate_multiple_voices(self,
                                 sentences: List[str],
                                 base_filename: str = "voicescript",
                                 split_sentences: bool = True) -> Dict[str, str]:
        results: Dict[str, str] = {}
        for i, sentence in enumerate(sentences, 1):
            filename = f"{base_filename}{i}.wav"
            path = self.generate_voice(sentence, filename, split_sentences=split_sentences)
            if path:
                results[sentence] = path
            else:
                self.logger.warning(f"Failed cloning sentence {i}")
        return results

# # Example usage:
# if __name__ == "__main__":
#     try:
#         generator = VoiceGenerator(channel="ChronoShift_Chronicles")
        
#         # Example list of sentences
#         sentences = [
#             "What if… you blinked, and suddenly, you're standing on the Free Fire spawn island? Prepare for a shocking, real-life battle royale!",
#     "Humid air, engine roars, fear... it's all real now. A countdown ticks relentlessly. Subscribe for more intense scenarios!",
#     "Your heart pounds, adrenaline spikes. A gloo wall grenade! Instinct kicks in, remembering victories. This time it’s survival.",
#     "Timer's at zero! Brace yourself! The jump is coming. Get ready for a desperate scramble for gear. The chaos awaits below!",
#     "Freefalling! The wind screams as you scan for a safe landing. Red flares signal high-tier loot. Where will you land?",
#     "A rooftop! You glide expertly, skills honed from countless hours. Landing: graceful, near a supply crate. Time to gear up!",
#     "AK47 and a level-two helmet! A small win against the odds. Confidence surges. But can you really survive this nightmare?",
#     "Footsteps! Your triumph is shattered. Virtual instincts take over. Cover behind a barrel, ready to defend at any cost. Danger!",
#     "A player armed with a pistol! Hesitation flickers, then vanishes as a bullet whizzes past your ear. It's game on, now!",
#     "AK47 raised, finger trembling. In this real-life Free Fire, only one survives. Are you ready to fight until the very end?"
#         ]
        
#         # Generate voices for all sentences using the selected speaker, speed, and sentence splitting.
#         results = generator.generate_multiple_voices(sentences)
        
#         # Print results
#         for sentence, filepath in results.items():
#             print(f"\nSentence: {sentence}")
#             print(f"Generated file: {filepath}")
            
#     except Exception as e:
#         print(f"Error in main: {str(e)}")
