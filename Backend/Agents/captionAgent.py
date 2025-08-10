"""Caption agent: transcribe audio via Groq Whisper and burn subtitles.

Legacy Whisper-based local implementation removed for clarity; use git history if needed.
"""

import subprocess
import os
from datetime import timedelta
from groq import Groq
from Config.settings import settings
from utils.logging_utils import log_event
from utils.exceptions import CaptionError

def format_timestamp(seconds):
    """Convert seconds to SRT timestamp format"""
    td = timedelta(seconds=seconds)
    hours = int(td.total_seconds() // 3600)
    minutes = int((td.total_seconds() // 60) % 60)
    secs = int(td.total_seconds() % 60)
    milliseconds = int(round((td.total_seconds() - int(td.total_seconds())) * 1000))
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{milliseconds:03d}"

def transcribe_and_caption(video_path, output_path="output.srt", model_name="whisper-large-v3", offset=0.1, video_mode=False, job_id: str | None = None):
    """
    Transcribe a video's audio using Groq Whisper API, build word/segment-level SRT, then burn glowing captions.
    Returns path to final captioned video. Raises CaptionError on any failure.
    """
    audio_path = os.path.splitext(video_path)[0] + ".m4a"
    output_video = None
    try:
        # 1. Extract audio
        extract_audio_cmd = [
            settings.get_ffmpeg(), "-y", "-i", video_path, "-vn", "-acodec", "aac", audio_path
        ]
        log_event(job_id, 'captions', 'extract_audio_start', cmd=' '.join(extract_audio_cmd))
        extract_proc = subprocess.run(extract_audio_cmd, capture_output=True, text=True)
        if extract_proc.returncode != 0 or not os.path.exists(audio_path):
            log_event(job_id, 'captions', 'extract_audio_failed', returncode=extract_proc.returncode, stderr=extract_proc.stderr[:400])
            raise CaptionError(f"Audio extraction failed: {extract_proc.stderr.strip()[:500]}")
        log_event(job_id, 'captions', 'extract_audio_done', size=os.path.getsize(audio_path))

        # 2. Transcription
        log_event(job_id, 'captions', 'init_model', model=model_name)
        client = Groq()
        log_event(job_id, 'captions', 'transcribe_start')
        with open(audio_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(audio_path, file.read()),
                model=model_name,
                response_format="verbose_json",
            )
        has_segments = hasattr(transcription, 'segments')
        log_event(job_id, 'captions', 'transcribe_done', has_segments=has_segments)

        # 3. Build SRT
        log_event(job_id, 'captions', 'caption_build_start')
        srt_index = 1
        with open(output_path, "w", encoding="utf-8") as srt_file:
            if has_segments:
                segments_list = transcription.segments
            else:
                segments_list = [{
                    'start': 0,
                    'end': 5,
                    'text': getattr(transcription, 'text', '')
                }]
            for segment in segments_list:
                # Normalize segment
                if isinstance(segment, dict):
                    start_time = segment.get('start', 0)
                    end_time = segment.get('end', start_time + 5)
                    text = segment.get('text', '').strip()
                    words = segment.get('words', [])
                else:
                    start_time = getattr(segment, 'start', 0)
                    end_time = getattr(segment, 'end', start_time + 5)
                    text = getattr(segment, 'text', '').strip()
                    words = getattr(segment, 'words', [])

                if words:
                    for word_info in words:
                        if isinstance(word_info, dict):
                            word_start = word_info.get('start', start_time)
                            word_end = word_info.get('end', word_start + 0.4)
                            word_text = word_info.get('word', '').strip()
                        else:
                            word_start = getattr(word_info, 'start', start_time)
                            word_end = getattr(word_info, 'end', word_start + 0.4)
                            word_text = getattr(word_info, 'word', '').strip()
                        word_end_adjusted = min(word_end + offset, end_time)
                        srt_file.write(f"{srt_index}\n")
                        srt_file.write(f"{format_timestamp(word_start)} --> {format_timestamp(word_end_adjusted)}\n")
                        srt_file.write(f"{word_text}\n\n")
                        srt_index += 1
                else:
                    srt_file.write(f"{srt_index}\n")
                    srt_file.write(f"{format_timestamp(start_time)} --> {format_timestamp(end_time)}\n")
                    srt_file.write(f"{text}\n\n")
                    srt_index += 1
        log_event(job_id, 'captions', 'caption_build_done', captions=srt_index-1)

        # 4. Probe video for dimensions
        probe_cmd = [
            settings.get_ffprobe(), "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=s=x:p=0", video_path
        ]
        dimensions = subprocess.check_output(probe_cmd, universal_newlines=True).strip()
        width, height = map(int, dimensions.split('x'))
        log_event(job_id, 'captions', 'probe_done', width=width, height=height)

        # 5. Prepare burn parameters (safe paths & simplified filter for performance)
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        output_video = os.path.join(output_dir, "output_with_captions.mp4")
        # Copy/normalize SRT path to temp with safe name (avoid colon issues in subtitles filter on Windows)
        safe_srt = os.path.join(os.path.dirname(output_video), "captions.srt")
        try:
            if output_path != safe_srt:
                # copy SRT to safe location
                import shutil
                shutil.copyfile(output_path, safe_srt)
        except Exception as copy_err:
            log_event(job_id, 'captions', 'srt_copy_warn', warning=str(copy_err))
            safe_srt = output_path  # fallback
        # Use forward slashes for ffmpeg
        srt_ff = safe_srt.replace('\\', '/').replace(':', '\\:')  # escape drive colon
        bottom_padding = 50
        font_size = max(14, int(height * (0.02 if video_mode else 0.013)))

        # Build simple outline filter first (fast)
        primary_style = (
            f"FontName=Arial,FontSize={font_size},PrimaryColour=&HFFFFFF&,Outline=4,Shadow=0,"
            f"BorderStyle=1,Alignment=2,MarginV={bottom_padding}"
        )
        simple_filter = f"subtitles={srt_ff}:force_style='{primary_style}'"

        # Fancy (optional) second attempt style (lighter glow imitation w/ bigger outline)
        fancy_style = primary_style.replace("Outline=4", "Outline=6")
        fancy_filter = f"subtitles={srt_ff}:force_style='{fancy_style}'"

        def run_burn(filter_expr: str, tag: str):
            cmd = [
                settings.get_ffmpeg(), '-y', '-i', video_path,
                '-vf', filter_expr,
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
                '-c:a', 'copy',
                output_video
            ]
            log_event(job_id, 'captions', 'burn_try', variant=tag)
            proc = subprocess.run(cmd, capture_output=True, text=True)
            return proc

        # Attempt simple first
        log_event(job_id, 'captions', 'burn_start', font_size=font_size, strategy='simple')
        proc = run_burn(simple_filter, 'simple')
        if proc.returncode != 0 or not os.path.exists(output_video):
            log_event(job_id, 'captions', 'burn_variant_failed', variant='simple', code=proc.returncode, stderr=proc.stderr[:300])
            # Attempt fancy variant
            proc2 = run_burn(fancy_filter, 'fancy')
            if proc2.returncode != 0 or not os.path.exists(output_video):
                log_event(job_id, 'captions', 'burn_failed', variant='fancy', code=proc2.returncode, stderr=proc2.stderr[:300])
                raise CaptionError(f"Caption burn failed (simple & fancy). Last error: {proc2.stderr.strip()[:500]}")
            else:
                log_event(job_id, 'captions', 'burn_done', variant='fancy', output=output_video)
                return output_video
        else:
            log_event(job_id, 'captions', 'burn_done', variant='simple', output=output_video)
            return output_video
    except CaptionError:
        raise
    except Exception as e:
        log_event(job_id, 'captions', 'error', error=str(e))
        raise CaptionError(str(e))
    finally:
        if os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except OSError:
                pass

    
# video_file = r"D:\AI_AGENT_FOR_YOUTUBE\YoutubeVideoGen\output\youtube_shorts_with_music.mp4"
# output_video = transcribe_and_caption(video_file)