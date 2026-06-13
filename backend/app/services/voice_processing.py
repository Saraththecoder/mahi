import io
import os
import logging
from typing import Dict, Any, Tuple
from app.config import settings

logger = logging.getLogger("uvicorn")

# Lazy imports
whisper = None
sr = None
gTTS = None

try:
    import speech_recognition as as_sr
    sr = as_sr
    logger.info("SpeechRecognition loaded successfully in voice_processing.py")
except ImportError:
    logger.warning("SpeechRecognition not found. Using transcription fallbacks.")

try:
    from gtts import gTTS as as_gtts
    gTTS = as_gtts
    logger.info("gTTS loaded successfully in voice_processing.py")
except ImportError:
    logger.warning("gTTS not found. Text-to-speech will return mock audio bytes.")

try:
    import whisper as as_whisper
    whisper = as_whisper
    logger.info("OpenAI Whisper loaded successfully in voice_processing.py")
except ImportError:
    pass

# Mock responses for voice queries - these are ONLY used as last resort
# when BOTH Google STT and Whisper fail and audio cannot be transcribed
VOICE_FALLBACK_GREETING = {
    "te": "నమస్తే",  # Returns 'hello' which triggers greeting handler
    "hi": "नमस्ते",
    "en": "hello"
}

def transcribe_audio(audio_bytes: bytes, language: str = "en") -> str:
    """
    Transcribes audio bytes to text in the requested language.
    Tries Google Speech Recognition (online, free), falls back to Whisper, then a safe greeting fallback.
    """
    lang_code_map = {
        "en": "en-US",
        "te": "te-IN",
        "hi": "hi-IN"
    }

    # 1. Try SpeechRecognition with Google Web Speech API
    if sr is not None:
        # Browsers record as webm/ogg — try to convert to wav using pydub if available
        wav_bytes = audio_bytes
        try:
            from pydub import AudioSegment
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
            wav_io = io.BytesIO()
            audio_segment.export(wav_io, format="wav")
            wav_bytes = wav_io.getvalue()
            logger.info("Audio converted to WAV using pydub.")
        except Exception as conv_err:
            logger.info(f"pydub not available or conversion failed: {conv_err}. Trying raw bytes as WAV.")

        try:
            r = sr.Recognizer()
            audio_file = io.BytesIO(wav_bytes)
            with sr.AudioFile(audio_file) as source:
                audio_data = r.record(source)
                text = r.recognize_google(audio_data, language=lang_code_map.get(language, "en-US"))
                logger.info(f"Google STT transcribed ({language}): {text}")
                return text
        except Exception as e:
            logger.warning(f"Google STT failed: {e}. Trying Whisper...")

    # 2. Try Whisper if installed locally
    if whisper is not None:
        try:
            temp_filename = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp_voice.wav")
            with open(temp_filename, "wb") as f:
                f.write(audio_bytes)
            model = whisper.load_model("base")
            result = model.transcribe(temp_filename, language=language)
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
            text = result.get("text", "").strip()
            logger.info(f"Whisper STT transcribed ({language}): {text}")
            if text:
                return text
        except Exception as e:
            logger.error(f"Whisper STT failed: {e}")

    # 3. Safe fallback: return a greeting so the chatbot responds with "Hello! How can I help?"
    #    instead of always injecting a cotton question
    logger.info(f"STT failed for {language}, returning greeting fallback.")
    return VOICE_FALLBACK_GREETING.get(language, "hello")

def generate_speech(text: str, language: str = "en") -> bytes:
    """
    Converts text to speech (audio bytes in MP3 format).
    Uses gTTS, falls back to dummy silent audio bytes.
    """
    if gTTS is not None:
        try:
            # gTTS supports languages: 'te' (Telugu), 'hi' (Hindi), 'en' (English)
            tts = gTTS(text=text, lang=language, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            logger.info(f"Generated gTTS audio for text length {len(text)} in {language}")
            return fp.read()
        except Exception as e:
            logger.error(f"gTTS Speech generation failed: {e}")
            
    # Fallback: return small dummy silent MP3/WAV bytes
    # This is a tiny 1-second silent MP3 file byte string
    dummy_mp3 = (
        b'\xff\xfb\x90\x44\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
        b'\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00'
    )
    logger.info("Returning mock empty audio bytes.")
    return dummy_mp3

def process_voice_query(audio_bytes: bytes, language: str = "en") -> Tuple[str, str, bytes]:
    """
    Full pipeline:
    1. Audio -> Transcribed text
    2. Transcribed text -> Bot text response (using rules or chatbot query)
    3. Bot response -> Synthesized Speech (audio bytes)
    """
    # 1. Speech to Text
    transcription = transcribe_audio(audio_bytes, language)
    
    # 2. Process query (We match our database keywords or use RAG answers)
    from app.services.rag_chatbot import query_chatbot
    chat_result = query_chatbot(transcription, language)
    response_text = chat_result["response"]
    
    # 3. Text to Speech
    speech_bytes = generate_speech(response_text, language)
    
    return transcription, response_text, speech_bytes
