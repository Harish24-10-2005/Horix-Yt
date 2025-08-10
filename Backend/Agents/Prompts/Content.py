VIDEO_PROMPT = """Write a faceless video script based on the title "{title}" designed for a YouTube audience that presents a unique perspective tailored specifically for the channel type "{channelType}". Create a compelling narrative structure with domain-specific terminology, pacing, and engagement tactics appropriate for the content category. The script should include:

Content Category Adaptation:
- Automatically detect and adapt to the content domain (educational, entertainment, tutorial, lifestyle, tech, gaming, etc.) based on "{title}" and "{channelType}".
- For tutorials/how-to content: Include precise step-by-step instructions with clear transitions and time indicators.
- For informational/educational content: Structure with clear thesis, evidence, counterpoints, and knowledge synthesis.
- For entertainment/storytelling: Create narrative arcs with tension building, climax, and resolution.
- For review/analysis content: Include balanced perspectives, criteria-based assessment, and comparative elements.
- For motivational/self-improvement: Incorporate challenges, solutions, and transformational frameworks.

Dynamic Opening:
- Craft a domain-appropriate hook based on content recognition of "{title}" - (provocative question for debates, surprising statistic for educational, immediate value proposition for tutorials, etc.)
- Implement the most effective attention-grabbing technique for the specific content category (demonstration of problem for tutorials, unexpected fact for educational, emotional scenario for lifestyle).
- Include relevant industry/domain-specific language that signals expertise in the subject matter.
- Establish clear audience benefits tailored to the viewing motivation (learning, entertainment, problem-solving, inspiration).
- End with a precise content preview that sets appropriate expectations based on content type.

Content-Optimized Body:
- For instructional content: Present clear, sequential steps with logical progression indicators.
- For informational content: Present multiple perspectives with evidence-based reasoning.
- For entertainment: Create emotional engagement through storytelling techniques appropriate to genre.
- For analytical content: Present balanced examination with supportive data and critical thinking.
- Include domain-specific terminology, references, and conceptual frameworks relevant to the content area.
- Anticipate and address common questions, challenges, or misconceptions specific to the topic.
- Integrate appropriate transitional phrases based on content type (sequential for tutorials, comparative for analysis, causal for educational).

Audience-Appropriate Conclusion:
- Craft endings optimized for the content type (clear outcome demonstration for tutorials, summary of key points for educational, emotional resolution for storytelling).
- Include targeted call-to-action based on viewer intent (implementation for tutorials, discussion for debates, channel engagement for entertainment).
- Incorporate forward-looking elements (advanced applications for tutorials, further research for educational, sequel hooks for entertainment).
- Connect conclusion directly to opening promise to create narrative satisfaction.

SEO and Engagement Optimization:
- Integrate trending keywords relevant to the specific content category and current platform algorithm patterns.
- Structure content for maximum retention based on engagement patterns of the specific content type.
- Include strategic engagement prompts at optimal points based on content format (early engagement for entertainment, mid-point for tutorials, spaced throughout for educational).
- Incorporate proven retention techniques specific to content category (clear visual cues for tutorials, curiosity gaps for educational, emotional investment for storytelling).

Take the following script and transform it into a JSON array of sentences. For each sentence in the script:
- Ensure proper stopping punctuation appropriate to sentence function and intensity.
- Integrate natural speech patterns with strategic pauses through comma placement.
- Adjust sentence structure for optimal clarity and impact based on content type.
- Output only a valid JSON list of sentences (i.e., an array of strings) with no additional text or formatting.

IMPORTANT: Generate entirely original content based on the title -> "{title}" and channel type -> "{channelType}". Analyze title intent to determine optimal content approach. Adapt length, depth, examples, and terminology to match standard viewer expectations for the specific content category and format."""

YT_SHORTS_PROMPT = """Write a faceless video script based on the title "{title}" designed for a YouTube Shorts audience that delivers high-impact content specific to channel type "{channelType}" with optimal pacing for the 60-second format. Create a perfectly structured script with:

Format-Optimized Structure:
- Automatically detect content category from "{title}" and "{channelType}" to implement optimal short-form structure.
- For tutorials: Design 3-stage rapid instruction with clear start-process-result framework.
- For informational: Create revelation structure with question-surprise-explanation pattern.
- For entertainment: Implement hook-escalation-punchline sequence with tension building.
- For motivational: Structure as problem-insight-transformation with emotional progression.
- For reactions/reviews: Create expectation-reality-verdict sequence with emotional contrast.

Attention-Commanding Opening (0-7 seconds):
- Deploy the most effective pattern-interrupt technique for the specific content type based on "{title}".
- Include immediate value proposition within first 3 seconds tailored to platform viewing patterns.
- Implement strategic curiosity trigger specific to content domain to prevent scrolling.
- Use psychologically optimized language patterns that maximize viewer retention for short-form.
- Create a cognitive open loop that compels continued viewing through the promise of specific value.

High-Density Content Core (8-45 seconds):
- Present core content with maximum information density while maintaining clarity.
- For tutorials: Demonstrate key action with emphasis on visual demonstration cues.
- For informational: Present surprising revelation or counter-intuitive insight with supporting evidence.
- For entertainment: Build emotional engagement through rapid story development techniques.
- Use domain-specific language that signals authority while remaining accessible.
- Incorporate strategic emphasis points with linguistic intensifiers at 15-second and 30-second marks.
- Include mid-point pattern interrupt to recapture wandering attention.

Impactful Conclusion (46-60 seconds):
- Create urgency-based call-to-action optimized for algorithm engagement metrics.
- For tutorials: Show clear transformation with satisfying before/after contrast.
- For informational: Deliver insight summary with immediate application prompt.
- For entertainment: Create resolution with emotional satisfaction and sharing incentive.
- Include specific engagement directive designed to maximize completion rate and sharing.
- End with algorithm-optimized hook that encourages repeated viewing or profile exploration.

Platform Optimization:
- Integrate trending audio/visual reference points relevant to current platform trends.
- Structure for maximum completion rate with strategic retention hooks at 10-second intervals.
- Incorporate language patterns proven effective for short-form vertical video engagement.
- Include specific visual direction cues that complement platform viewing patterns.
- Optimize for sound-on and sound-off viewing simultaneously.

Take the following script and transform it into a JSON array of sentences. For each sentence:
- Ensure optimal stopping punctuation for rhythm and engagement.
- Structure sentences with strategic comma placement for natural speech flow and emphasis.
- Adjust sentence length for platform-optimized pacing (shorter at beginning, varied in middle, impactful at end).
- Output only a valid JSON list of sentences (i.e., an array of strings) with no additional text or formatting.

IMPORTANT: Generate completely original content based on the title -> "{title}" and channel type -> "{channelType}". Analyze title intent to determine the most effective short-form approach. Adapt pacing, terminology, and engagement tactics to maximize retention for the specific content category within the 60-second format."""

YT_SCRIPT_PROMPT = """Transform the following base content into a PRODUCTION-READY long‑form YouTube narration + visual plan.
SOURCE_CONTENT: {content}

OUTPUT STRICTLY AS A SINGLE VALID JSON OBJECT WITH THESE KEYS (and ONLY these keys):
  voice_scripts (array[str])
  image_prompts (array[str])
  voice_meta (array[object])
  image_prompts_detailed (array[object])

RULES – VOICE SCRIPTS:
1. EXACTLY 10 paragraphs. Cohesive narrative arc: Hook, Context, Build, Deepening, Tension, Shift, Proof, Synthesis, Payoff, Call‑To‑Action.
2. Natural spoken cadence: contractions, strategic pauses ("," / "—"), varied sentence length, no run‑ons.
3. Each paragraph ends with a full stop or question mark (no ellipses unless stylistically justified once).
4. Subtle engagement prompts (1–2 total, not spammy) in mid or final thirds.
5. Paragraph n MUST map to images (3n-2, 3n-1, 3n).

VOICE META (voice_meta array) – one object per paragraph:
{
  "index": 1-10,
  "tone": "authoritative | conversational | suspenseful | inspirational | playful | urgent | reflective" (choose best fit),
  "emotion_intensity": 1-5,
  "pace_hint_wpm": integer (135–175),
  "primary_emotion": "curiosity|awe|excitement|concern|confidence|wonder|focus|urgency|relief|inspiration",
  "audio_background_suggestion": "subtle ambient synth|light percussion|cinematic pulse|none|warm lo-fi",
  "visual_theme": short phrase summarizing environment/scene mood.
}

RULES – IMAGE PROMPTS (image_prompts + image_prompts_detailed):
TOTAL: 30 (3 per voice paragraph). Maintain PERFECT character + style continuity.
First image establishes canonical character + style tokens reused verbatim: e.g. "ultra detailed cinematic 4k, soft volumetric lighting, shallow depth of field, color graded teal & amber, Nikon Z9, 85mm lens" OR if content implies abstract / infographic, define a consistent vector or motion‑graphic style.
Each subsequent prompt MUST:
  - Reference the SAME CHARACTER or SUBJECT exactly (repeat core descriptor string).
  - Include: Shot type, camera / lens or perspective, action progression, evolving environment, lighting, mood, color palette, style tokens, and which script+stage (opening|mid|conclusion).
  - Be concise but information dense (<= 55 words).
Add cinematic realism unless content domain requires stylized/diagrammatic treatment (e.g. complex scientific or finance explanation → allow elegant infographic hybrid, consistent style tag).
AVOID: watermarks, text overlays, disfigured anatomy, duplicate limbs, distorted faces.
Include a subtle continuity cue each image (e.g. recurring prop, color accent) so temporal order is clear.

image_prompts array: PLAIN strings (backward compatibility) using pattern:
  "Image X (Script Y - Segment): <prompt>"

image_prompts_detailed array: objects:
  {
    "image_index": int,
    "script_index": int,
    "segment": "opening|middle|conclusion",
    "prompt": "Full positive prompt text",
    "negative_prompt": "blurry, low quality, watermark, text, distorted anatomy, extra limbs, noise, artifacts",
    "shot_type": "close-up|medium|wide|aerial|macro|over-the-shoulder|POV",
    "lighting": "cinematic volumetric|soft diffused|golden hour|moody chiaroscuro|studio softbox",
    "style": "cinematic 4k photoreal" OR consistent stylized tag,
    "continuity_cue": "short description of recurring element" 
  }

CRITICAL ALIGNMENT:
Voice paragraph i => images (3i-2 opening), (3i-1 middle), (3i conclusion).
Opening image: Establish / introduce idea.
Middle image: Progression / interaction / transformation.
Conclusion image: Resolution / payoff / transition hook.

CONTENT ADAPTATION:
Infer domain (tech, science, cooking, finance, fitness, motivation, history, storytelling, gaming, analysis). Adjust:
  - Tone, metaphors, reference points.
  - Visual world (lab, kitchen, studio, abstract data space, outdoors, etc.).
  - Style choice (photoreal vs clean vector) logically.

OUTPUT FORMAT EXAMPLE (structure ONLY, do not include comments):
{
  "voice_scripts": ["Paragraph 1...", "Paragraph 2...", ..., "Paragraph 10..."],
  "image_prompts": ["Image 1 (Script 1 - Opening): ...", "Image 2 (Script 1 - Middle): ...", ... , "Image 30 (Script 10 - Conclusion): ..."],
  "voice_meta": [ {"index":1, "tone":"authoritative", ... }, ... ],
  "image_prompts_detailed": [ {"image_index":1, "script_index":1, "segment":"opening", "prompt":"...", "negative_prompt":"...", ...}, ... ]
}

VALIDATION:
1. EXACT counts: 10 voice_scripts, 30 image_prompts, 10 voice_meta objects, 30 image_prompts_detailed.
2. Consistent character/style tokens reused.
3. No null / empty strings.
4. JSON must parse without repair.

Return ONLY the JSON object, no prose, no markdown fencing.
"""

YT_SHORTS_SCRIPT_PROMPT = """Convert the base content into a PRODUCTION-READY YouTube SHORTS package (vertical, fast retention) with structured JSON.
SOURCE_CONTENT: {content}

REQUIRED JSON KEYS:
  voice_scripts (array[str])  # EXACTLY 3
  image_prompts (array[str])  # EXACTLY 15 (5 per paragraph)
  voice_meta (array[object])  # EXACTLY 3
  image_prompts_detailed (array[object])  # EXACTLY 15

VOICE (3 segments):
1. Hook (0–15s): pattern interrupt + clear value promise, emotional spike in first 3 seconds.
2. Core (16–40s): compressed insight / steps / transformation sequence.
3. Payoff + CTA (41–60s): resolution + single strong call to action (subscribe / comment insight / share) – only one CTA.

VOICE META OBJECT per paragraph:
{ "index":1-3, "tone":"high-energy|curious|dramatic|inspirational|playful|authoritative", "emotion_intensity":1-5, "pace_hint_wpm":170-195, "primary_emotion":"curiosity|excitement|urgency|wonder|confidence|inspiration", "visual_theme":"short phrase", "beat_markers_sec":[ approximate key beat seconds inside this segment ] }

IMAGE PROMPTS (continuity + vertical framing):
Total 15. Use consistent character/style descriptor from Image 1.
Each must specify vertical framing cue: "portrait orientation, 9:16".
Include: shot_type, camera/perspective, action progression, evolving environment, lighting, color mood, style tokens, segment role (hook/core/conclusion), motion or energy hint.
Keep each prompt <= 40 words but information dense. Avoid redundant adjectives.
Encourage scroll‑stop visuals in images 1–3 (bold contrast, dynamic angle). Mid images reinforce clarity; final images build crescendo then closure.

image_prompts_detailed objects:
{
  "image_index": 1-15,
  "script_index": 1-3,
  "segment": "hook|core|conclusion",
  "prompt": "full positive prompt",
  "negative_prompt": "blurry, low quality, watermark, text, distorted anatomy, extra limbs, noise, artifacts",
  "shot_type": "extreme close-up|close-up|medium|wide|low angle|high angle|POV|aerial",
  "lighting": "bold contrast|cinematic soft|neon accent|golden hour|studio softbox|moody rim",
  "style": "photoreal cinematic 4k" OR consistent stylized descriptor,
  "continuity_cue": "shared element (color prop gesture etc.)"
}

MAPPING:
Script 1 → images 1–5 (hook progression)
Script 2 → images 6–10 (core)
Script 3 → images 11–15 (conclusion)

VALIDATION:
Counts correct; JSON valid; no markdown fences; consistent character/style; no empty strings.

Return ONLY the JSON object.
"""