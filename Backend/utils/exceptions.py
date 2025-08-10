class PipelineError(Exception):
    """Base error for pipeline-related issues."""

class ContentError(PipelineError):
    pass

class ScriptError(PipelineError):
    pass

class ImageError(PipelineError):
    pass

class VoiceError(PipelineError):
    pass

class EditError(PipelineError):
    pass

class MusicError(PipelineError):
    pass

class CaptionError(PipelineError):
    pass

class JobNotFoundError(PipelineError):
    pass
