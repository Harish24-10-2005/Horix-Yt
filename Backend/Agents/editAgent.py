import os
import subprocess
from PIL import Image
from pydub import AudioSegment
import shutil
import tempfile
from Config.settings import settings
from utils.logging_utils import log_event, StageTimer

class VideoEditor:
    def __init__(self,video_mode: bool = False, job_id: str | None = None):
        self.temp_dir = tempfile.mkdtemp()
        self.job_id = job_id
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
            settings.get_ffmpeg(), '-y',
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
            subprocess.run([
                settings.get_ffmpeg(), '-y', '-f', 'concat', '-safe', '0', '-i', segment_list, '-c', 'copy', segment_video
            ], check=True)
            final_segment = os.path.join(self.temp_dir, f'final_segment_{voice_idx}.mp4')
            subprocess.run([
                settings.get_ffmpeg(), '-y', '-i', segment_video, '-i', voice_path, '-c:v', 'copy', '-c:a', 'aac', '-shortest', final_segment
            ], check=True)
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
        subprocess.run([
            settings.get_ffmpeg(), '-y', '-f', 'concat', '-safe', '0', '-i', final_concat, '-c', 'copy', output_path
        ], check=True)
        shutil.rmtree(self.temp_dir)
        log_event(self.job_id, 'edit', 'completed', output=output_path)
        return output_path

    def create_gap(self, output_path):
        """Create a short (20-millisecond) black gap"""
        cmd = [
            settings.get_ffmpeg(), '-y',
            '-f', 'lavfi',
            '-i', f'color=c=black:s={self.width}x{self.height}:d=0.01',
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-pix_fmt', 'yuv420p',
            output_path
        ]
        subprocess.run(cmd, check=True)

"""Video editing utilities for assembling image + voice segments.

Developer note: Removed commented CLI demo block; keep file lean.
"""