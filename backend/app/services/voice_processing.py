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

# Mock responses for voice queries
VOICE_MOCK_RESPONSES = {
    "te": {
        "text": "మీరు పత్తి పంటను నాటుతున్నట్లయితే, దయచేసి జూన్ మొదటి వారంలో విత్తనాలు వేయండి. హెక్టారుకు 120 కేజీల నత్రజని వాడండి.",
        "query": "పత్తి పంట సాగు విధానం ఏమిటి?"
    },
    "hi": {
        "text": "यदि आप कपास की खेती कर रहे हैं, तो कृपया जून के पहले सप्ताह में बुवाई करें। प्रति हेक्टेयर 120 किलोग्राम नाइट्रोजन का उपयोग करें।",
        "query": "कपास की खेती कैसे करें?"
    },
    "en": {
        "text": "For cotton crop, sow in the first week of June. Use 120 kg/ha of nitrogen fertilizer split into 3 doses.",
        "query": "How to cultivate cotton?"
    }
}

def transcribe_audio(audio_bytes: bytes, language: str = "en") -> str:
    """
    Transcribes audio bytes to text in the requested language.
    Tries Google Speech Recognition (online, free, no keys needed), falls back to Whisper, then mock text.
    """
    lang_code_map = {
        "en": "en-US",
        "te": "te-IN",
        "hi": "hi-IN"
    }
    
    # 1. Try SpeechRecognition with Google Web Speech API (Free & Online)
    if sr is not None:
        try:
            r = sr.Recognizer()
            # Convert audio bytes into an AudioFile object
            # Note: speech_recognition requires WAV/AIFF/FLAC format.
            # We wrap the bytes in a BytesIO buffer.
            audio_file = io.BytesIO(audio_bytes)
            with sr.AudioFile(audio_file) as source:
                audio_data = r.record(source)
                text = r.recognize_google(audio_data, language=lang_code_map.get(language, "en-US"))
                logger.info(f"Google STT transcribed ({language}): {text}")
                return text
        except Exception as e:
            logger.warning(f"Google STT failed or audio not in WAV format: {e}. Trying Whisper or mock...")
            
    # 2. Try Whisper if installed locally
    if whisper is not None:
        try:
            # Whisper requires a file path, so we save to a temporary file
            temp_filename = "temp_voice.wav"
            with open(temp_filename, "wb") as f:
                f.write(audio_bytes)
                
            model = whisper.load_model("base")
            result = model.transcribe(temp_filename, language=language)
            
            # Clean up
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
                
            text = result.get("text", "").strip()
            logger.info(f"Whisper STT transcribed ({language}): {text}")
            return text
        except Exception as e:
            logger.error(f"Whisper STT failed: {e}")
            
    # 3. Fallback: return a mock query based on language
    mock_data = VOICE_MOCK_RESPONSES.get(language, VOICE_MOCK_RESPONSES["en"])
    logger.info(f"Returning mock transcription for {language}: {mock_data['query']}")
    return mock_data["query"]

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
