import os
import subprocess
from PIL import Image
from pydub import AudioSegment
import shutil
import tempfile
from Config.settings import settings
from utils.logging_utils import log_event, StageTimer
import shutil as _shutil

class VideoEditor:
    def __init__(self,video_mode: bool = False, job_id: str | None = None):
        self.temp_dir = tempfile.mkdtemp()
        self.job_id = job_id
        # Ensure pydub can locate ffmpeg/ffprobe even if not on PATH (Windows-friendly)
        try:
            ffmpeg_bin = settings.get_ffmpeg()
            ffprobe_bin = settings.get_ffprobe()
            if ffmpeg_bin:
                AudioSegment.converter = ffmpeg_bin
                # Back-compat aliases used by some pydub versions
                AudioSegment.ffmpeg = ffmpeg_bin  # type: ignore[attr-defined]
            if ffprobe_bin:
                AudioSegment.ffprobe = ffprobe_bin  # type: ignore[attr-defined]
        except Exception:
            pass
        # Resolve ffmpeg/ffprobe once and normalize to executables on Windows
        def _clean(p: str | None) -> str:
            s = (p or '').strip().strip('"').strip("'")
            # Remove control chars that can sneak in via env (\r, \n, \t, \f, \b)
            return s.replace('\r','').replace('\n','').replace('\t','').replace('\f','').replace('\b','')

        self.ffmpeg = _clean(settings.get_ffmpeg())
        self.ffprobe = _clean(settings.get_ffprobe())
        def _resolve_win(path: str, exe_name: str) -> str:
            # Directory -> join exe
            if os.path.isdir(path):
                cand = os.path.join(path, exe_name)
                if os.path.isfile(cand):
                    return cand
            # Ends with bin -> join exe (even if os.path.isdir fails due to perms)
            if path.lower().rstrip('\\/').endswith('bin'):
                cand = os.path.join(path, exe_name)
                if os.path.isfile(cand):
                    return cand
                return cand  # return joined path regardless; later isfile check will validate
            # Naked without .exe -> try add
            if not path.lower().endswith('.exe'):
                cand = path + '.exe'
                if os.path.isfile(cand):
                    return cand
            # Try FFMPEG_HOME
            home = os.getenv('FFMPEG_HOME')
            if home:
                cand = os.path.join(home, 'bin', exe_name)
                if os.path.isfile(cand):
                    return cand
            # Common C:\ffmpeg locations
            base = 'C:\\ffmpeg'
            if os.path.isdir(base):
                cand = os.path.join(base, 'bin', exe_name)
                if os.path.isfile(cand):
                    return cand
                try:
                    for name in os.listdir(base):
                        cand = os.path.join(base, name, 'bin', exe_name)
                        if os.path.isfile(cand):
                            return cand
                except Exception:
                    pass
            # PATH
            found = _shutil.which(exe_name.split('.')[0])
            if found:
                return found
            return path

        try:
            if os.name == 'nt':
                self.ffmpeg = _resolve_win(self.ffmpeg, 'ffmpeg.exe')
                self.ffprobe = _resolve_win(self.ffprobe, 'ffprobe.exe')
        except Exception:
            pass
        try:
            log_event(job_id, 'edit', 'ffmpeg_resolve', ffmpeg=self.ffmpeg, ffprobe=self.ffprobe)
        except Exception:
            pass
        try:
            if os.name == 'nt':
                # Handle bin-suffix without relying on isdir (works even if path checks fail)
                if self.ffmpeg and self.ffmpeg.lower().rstrip('\\/') .endswith('bin'):
                    self.ffmpeg = os.path.join(self.ffmpeg, 'ffmpeg.exe')
                if self.ffprobe and self.ffprobe.lower().rstrip('\\/') .endswith('bin'):
                    self.ffprobe = os.path.join(self.ffprobe, 'ffprobe.exe')
                # Append .exe if missing and file exists alongside
                if self.ffmpeg and not self.ffmpeg.lower().endswith('.exe'):
                    cand = self.ffmpeg + '.exe'
                    if os.path.exists(cand):
                        self.ffmpeg = cand
                if self.ffprobe and not self.ffprobe.lower().endswith('.exe'):
                    cand2 = self.ffprobe + '.exe'
                    if os.path.exists(cand2):
                        self.ffprobe = cand2
        except Exception:
            pass
        # Now inform pydub and PATH with the finalized executables
        try:
            if self.ffmpeg:
                AudioSegment.converter = self.ffmpeg
                AudioSegment.ffmpeg = self.ffmpeg  # type: ignore[attr-defined]
            if self.ffprobe:
                AudioSegment.ffprobe = self.ffprobe  # type: ignore[attr-defined]
            for tool in (self.ffmpeg, self.ffprobe):
                d = os.path.dirname(tool)
                if d and os.path.isdir(d) and d not in os.environ.get('PATH',''):
                    os.environ['PATH'] = d + os.pathsep + os.environ.get('PATH','')
        except Exception:
            pass
        # Log raw env-configured paths for diagnostics
        try:
            log_event(job_id, 'edit', 'ffmpeg_src', env_ffmpeg=getattr(settings, 'FFMPEG_PATH', None), env_ffprobe=getattr(settings, 'FFPROBE_PATH', None))
        except Exception:
            pass
        # Verify ffmpeg/ffprobe existence to fail fast with a clear message
        try:
            if not (self.ffmpeg and os.path.isfile(self.ffmpeg)):
                raise FileNotFoundError(f"FFmpeg not found at: {self.ffmpeg}")
            if not (self.ffprobe and os.path.isfile(self.ffprobe)):
                raise FileNotFoundError(f"FFprobe not found at: {self.ffprobe}")
        except Exception as e:
            try:
                log_event(job_id, 'edit', 'ffmpeg_error', error=str(e), ffmpeg=self.ffmpeg, ffprobe=self.ffprobe)
            except Exception:
                pass
            raise
        try:
            log_event(job_id, 'edit', 'ffmpeg', ffmpeg=self.ffmpeg, ffprobe=self.ffprobe)
        except Exception:
            pass
        if video_mode:
            self.width = 1920
            self.height = 1080
            log_event(job_id, 'edit', 'init', mode='long', width=self.width, height=self.height)
        else:
            self.width = 1080
            self.height = 1920
            log_event(job_id, 'edit', 'init', mode='shorts', width=self.width, height=self.height)
        
    def validate_files(self, image_dir, voice_dir, video_mode: bool = False):
        """Validate images & voices; allow any multiple instead of fixed 5/3.

        Returns (image_files, voice_files, images_per_voice)
        """
        image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        voice_files = [f for f in os.listdir(voice_dir) if f.lower().endswith(('.mp3', '.wav'))]

        image_files.sort(key=lambda f: os.path.getctime(os.path.join(image_dir, f)))
        voice_files.sort(key=lambda f: os.path.getctime(os.path.join(voice_dir, f)))

        if not voice_files:
            raise ValueError("No voice files found")
        if not image_files:
            raise ValueError("No image files found")
        if len(image_files) % len(voice_files) != 0:
            raise ValueError(
                f"Images ({len(image_files)}) must be a multiple of voice files ({len(voice_files)})."
            )
        images_per_voice = len(image_files) // len(voice_files)
        if not video_mode and (images_per_voice < 3 or images_per_voice > 10):
            log_event(self.job_id, 'edit', 'images_per_voice_unusual', images_per_voice=images_per_voice)
        if video_mode and (images_per_voice < 2 or images_per_voice > 8):
            log_event(self.job_id, 'edit', 'images_per_voice_unusual', images_per_voice=images_per_voice)
        return image_files, voice_files, images_per_voice

    def get_audio_duration(self, audio_path):
        """Get duration of audio file in seconds"""
        audio = AudioSegment.from_file(audio_path)
        return len(audio) / 1000.0

    def resize_image(self, image_path, output_path):
        """Resize image to fit YouTube Shorts dimensions"""
        with Image.open(image_path) as img:
            # Calculate new dimensions maintaining aspect ratio
            ratio = min(self.width / img.width, self.height / img.height)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            
            # Resize image
            resized = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Create new image with black background
            new_img = Image.new('RGB', (self.width, self.height), (0, 0, 0))
            
            # Paste resized image in center
            x = (self.width - new_size[0]) // 2
            y = (self.height - new_size[1]) // 2
            new_img.paste(resized, (x, y))
            
            new_img.save(output_path, 'PNG')

    def create_video_segment(self, image_path, duration, output_path, effect_type="zoom"):
        """Create video segment with zoom/pan effect"""
        # Resize image first
        temp_img_path = os.path.join(self.temp_dir, 'temp_resized.png')
        self.resize_image(image_path, temp_img_path)
        
        # Define filter based on effect type
        if effect_type == "zoom":
            filter_complex = (
                f"[0:v]scale={self.width}:{self.height},"
                f"zoompan=z='if(lte(zoom,1.0),1.1,max(1.001,zoom-0.0015))':"
                f"d={int(duration*30)}:s={self.width}x{self.height}[v]"
            )
        elif effect_type == "slide":
            filter_complex = (
                f"[0:v]scale={self.width}:{self.height},"
                f"crop={self.width}:{self.height}:x='(iw-{self.width})*t/{duration}':y=0,"
                f"pad={self.width}:{self.height}:(ow-iw)/2:(oh-ih)/2[v]"
            )
        elif effect_type == "fade":
            # This example creates a fade-in effect over the first 1 second.
            filter_complex = (
                f"[0:v]scale={self.width}:{self.height},fade=t=in:st=0:d=1[v]"
            )

        else:  # pan effect
            filter_complex = (
                f"[0:v]scale={self.width}:{self.height},"
                f"crop={self.width}:{self.height}:"
                f"iw/2-(iw/2)*sin(t/5):"
                f"ih/2-(ih/2)*sin(t/7)[v]"
            )

        zoom_cmd = [
            self.ffmpeg, '-y',
            '-loop', '1',
            '-i', temp_img_path,
            '-t', str(duration),
            '-filter_complex', filter_complex,
            '-map', '[v]',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-preset', 'medium',
            output_path
        ]
        
        try:
            log_event(self.job_id, 'edit', 'run_ffmpeg', cmd=zoom_cmd[:8])
        except Exception:
            pass
        subprocess.run(zoom_cmd, check=True)

    def create_final_video(self, image_dir, voice_dir, video_mode = False):
        # Determine output filename based on mode
        output_path = 'output/standard_video.mp4' if video_mode else 'output/youtube_shorts.mp4'
        log_event(self.job_id, 'edit', 'start_assembly', output=output_path)
        image_files, voice_files, images_per_voice = self.validate_files(image_dir, voice_dir, video_mode=video_mode)
        log_event(self.job_id, 'edit', 'validated', images=len(image_files), voices=len(voice_files), images_per_voice=images_per_voice)
        segments = []

        for voice_idx, voice_file in enumerate(voice_files):
            log_event(self.job_id, 'edit', 'process_voice', index=voice_idx+1, total=len(voice_files))
            voice_path = os.path.join(voice_dir, voice_file)
            voice_duration = self.get_audio_duration(voice_path)
            image_duration = voice_duration / images_per_voice if images_per_voice else voice_duration
            image_segments = []
            for j in range(images_per_voice):
                img_idx = voice_idx * images_per_voice + j
                image_path = os.path.join(image_dir, image_files[img_idx])
                temp_segment = os.path.join(self.temp_dir, f'temp_segment_{img_idx}.mp4')
                if j % 5 == 0:
                    effect_type = "fade"
                elif j % 5 == 1:
                    effect_type = "zoom"
                elif j % 5 == 2:
                    effect_type = "pan"
                elif j % 5 == 3:
                    effect_type = "slide"
                else:
                    effect_type = "zoom"
                self.create_video_segment(image_path, image_duration, temp_segment, effect_type)
                image_segments.append(temp_segment)

            segment_list = os.path.join(self.temp_dir, f'segment_list_{voice_idx}.txt')
            with open(segment_list, 'w') as f:
                for seg in image_segments:
                    f.write(f"file '{seg}'\n")
            segment_video = os.path.join(self.temp_dir, f'segment_{voice_idx}.mp4')
            cmd1 = [
                self.ffmpeg, '-y', '-f', 'concat', '-safe', '0', '-i', segment_list, '-c', 'copy', segment_video
            ]
            try:
                log_event(self.job_id, 'edit', 'run_ffmpeg', cmd=cmd1[:8])
            except Exception:
                pass
            subprocess.run(cmd1, check=True)
            final_segment = os.path.join(self.temp_dir, f'final_segment_{voice_idx}.mp4')
            cmd2 = [
                self.ffmpeg, '-y', '-i', segment_video, '-i', voice_path, '-c:v', 'copy', '-c:a', 'aac', '-shortest', final_segment
            ]
            try:
                log_event(self.job_id, 'edit', 'run_ffmpeg', cmd=cmd2[:8])
            except Exception:
                pass
            subprocess.run(cmd2, check=True)
            segments.append(final_segment)
            if voice_idx < len(voice_files) - 1:
                gap_path = os.path.join(self.temp_dir, f'gap_{voice_idx}.mp4')
                self.create_gap(gap_path)
                segments.append(gap_path)
            log_event(self.job_id, 'edit', 'voice_done', index=voice_idx+1)

        final_concat = os.path.join(self.temp_dir, 'final_concat.txt')
        with open(final_concat, 'w') as f:
            for segment in segments:
                f.write(f"file '{segment}'\n")
        log_event(self.job_id, 'edit', 'concat_segments', count=len(segments))
        cmd3 = [
            self.ffmpeg, '-y', '-f', 'concat', '-safe', '0', '-i', final_concat, '-c', 'copy', output_path
        ]
        try:
            log_event(self.job_id, 'edit', 'run_ffmpeg', cmd=cmd3[:8])
        except Exception:
            pass
        subprocess.run(cmd3, check=True)
        shutil.rmtree(self.temp_dir)
        log_event(self.job_id, 'edit', 'completed', output=output_path)
        return output_path

    def create_gap(self, output_path):
        """Create a short (20-millisecond) black gap"""
        cmd = [
            self.ffmpeg, '-y',
            '-f', 'lavfi',
            '-i', f'color=c=black:s={self.width}x{self.height}:d=0.01',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-pix_fmt', 'yuv420p',
            output_path
        ]
        try:
            log_event(self.job_id, 'edit', 'run_ffmpeg', cmd=cmd[:8])
        except Exception:
            pass
        subprocess.run(cmd, check=True)

"""Video editing utilities for assembling image + voice segments.

Developer note: Removed commented CLI demo block; keep file lean.
"""

# if __name__ == "__main__":
#     import argparse
#     import sys

#     parser = argparse.ArgumentParser(description="Self-test for VideoEditor using existing assets")
#     parser.add_argument("--images", default="assets/images", help="Directory with images")
#     parser.add_argument("--voices", default="assets/VoiceScripts", help="Directory with voice audio (.wav/.mp3)")
#     parser.add_argument("--mode", choices=["shorts","standard"], default="shorts", help="Video mode: shorts (1080x1920) or standard (1920x1080)")
#     parser.add_argument("--job", default="selftest", help="Job id for logging")
#     args = parser.parse_args()

#     video_mode = True if args.mode == "standard" else False
#     print("[selftest] Starting VideoEditor")
#     try:
#         editor = VideoEditor(video_mode=video_mode, job_id=args.job)
#         print(f"[selftest] ffmpeg: {editor.ffmpeg}")
#         print(f"[selftest] ffprobe: {editor.ffprobe}")
#     except Exception as e:
#         print(f"[selftest] Failed to initialize editor: {e}")
#         sys.exit(1)

#     try:
#         imgs = sorted([f for f in os.listdir(args.images) if f.lower().endswith((".png",".jpg",".jpeg"))])
#         voices = sorted([f for f in os.listdir(args.voices) if f.lower().endswith((".wav",".mp3"))])
#         print(f"[selftest] Found {len(imgs)} images in {args.images}")
#         print(f"[selftest] Found {len(voices)} voice files in {args.voices}")
#         if not imgs or not voices:
#             print("[selftest] ERROR: Need at least one image and one voice file.")
#             sys.exit(2)
#     except Exception as e:
#         print(f"[selftest] Failed to list assets: {e}")
#         sys.exit(3)

#     try:
#         out = editor.create_final_video(args.images, args.voices, video_mode=video_mode)
#         print(f"[selftest] Success: {out}")
#         sys.exit(0)
#     except Exception as e:
#         print(f"[selftest] Edit failed: {e}")
#         sys.exit(4)