const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface DiseaseResponse {
  _id: string;
  crop: string;
  disease_name: string;
  confidence: number;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  image_url?: string;
  created_at: string;
}

export interface FertilizerResponse {
  _id: string;
  crop_type: string;
  N: number;
  P: number;
  K: number;
  pH: number;
  moisture: number;
  recommended_fertilizer: string;
  quantity: string;
  instructions: string;
  created_at: string;
}

export interface PesticideResponse {
  _id: string;
  crop: string;
  disease: string;
  area: number;
  pesticide_name: string;
  pesticide_quantity: string;
  water_quantity: string;
  frequency: string;
  safety_instructions: string;
  created_at: string;
}

export interface WeatherResponse {
  _id: string;
  lat: number;
  lon: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  rain_probability: number;
  spray_suitability: string;
  suitability_reason: string;
  recommendations: string[];
  created_at: string;
}

export interface ChatResponse {
  _id: string;
  session_id: string;
  user_message: string;
  bot_response: string;
  language: string;
  source_documents: Array<{ title: string; source: string }>;
  created_at: string;
}

export interface HealthResponse {
  _id: string;
  crop_type: string;
  health_score: number;
  disease_risk: string;
  weather_risk: string;
  soil_status: string;
  recommendations: string[];
  created_at: string;
}

export interface SchemeResponse {
  _id: string;
  title: string;
  description: string;
  category: string;
  eligibility: string[];
  benefits: string[];
  required_documents: string[];
  application_process: string;
  official_website: string;
}

export interface CenterResponse {
  _id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_number?: string;
  working_hours?: string;
  distance_km?: number;
}

export interface VoiceResponse {
  transcription: string;
  response: string;
  audio_base64: string;
}

export const api = {
  // Disease Detection
  async detectDisease(imageFile: File, lang: string): Promise<DiseaseResponse> {
    const formData = new FormData();
    formData.append('file', imageFile);
    const res = await fetch(`${API_BASE_URL}/disease/detect?lang=${lang}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Disease detection failed');
    return res.json();
  },

  async getDiseaseHistory(): Promise<DiseaseResponse[]> {
    const res = await fetch(`${API_BASE_URL}/disease/history`);
    return res.json();
  },

  // Fertilizer Recommendation
  async recommendFertilizer(
    data: { crop_type: string; N: number; P: number; K: number; pH: number; moisture: number },
    lang: string
  ): Promise<FertilizerResponse> {
    const res = await fetch(`${API_BASE_URL}/fertilizer/recommend?lang=${lang}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Fertilizer recommendation failed');
    return res.json();
  },

  async getFertilizerHistory(): Promise<FertilizerResponse[]> {
    const res = await fetch(`${API_BASE_URL}/fertilizer/history`);
    return res.json();
  },

  // Pesticide Calculator
  async calculatePesticide(
    data: { crop: string; disease: string; area: number },
    lang: string
  ): Promise<PesticideResponse> {
    const res = await fetch(`${API_BASE_URL}/pesticide/calculate?lang=${lang}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Pesticide calculation failed');
    return res.json();
  },

  async getPesticideHistory(): Promise<PesticideResponse[]> {
    const res = await fetch(`${API_BASE_URL}/pesticide/history`);
    return res.json();
  },

  // Weather Advisory
  async getWeatherAdvisory(lat: number, lon: number, lang: string): Promise<WeatherResponse> {
    const res = await fetch(`${API_BASE_URL}/weather/advisory?lat=${lat}&lon=${lon}&lang=${lang}`);
    if (!res.ok) throw new Error('Weather advisory request failed');
    return res.json();
  },

  // RAG Chatbot
  async queryChatbot(message: string, sessionId: string | null, language: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chatbot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId, language }),
    });
    if (!res.ok) throw new Error('Chatbot query failed');
    return res.json();
  },

  async getChatHistory(sessionId: string): Promise<ChatResponse[]> {
    const res = await fetch(`${API_BASE_URL}/chatbot/history/${sessionId}`);
    return res.json();
  },

  // Crop Health Score
  async calculateCropHealth(
    data: {
      crop_type: string;
      N: number;
      P: number;
      K: number;
      pH: number;
      moisture: number;
      temperature: number;
      humidity: number;
      disease_detected?: string;
    },
    lang: string
  ): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/health/score?lang=${lang}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Crop health calculation failed');
    return res.json();
  },

  async getHealthHistory(): Promise<HealthResponse[]> {
    const res = await fetch(`${API_BASE_URL}/health/history`);
    return res.json();
  },

  // Government Schemes
  async getGovernmentSchemes(category: string | null, lang: string): Promise<SchemeResponse[]> {
    const url = category
      ? `${API_BASE_URL}/schemes/?category=${encodeURIComponent(category)}&lang=${lang}`
      : `${API_BASE_URL}/schemes/?lang=${lang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Government schemes fetch failed');
    return res.json();
  },

  // Nearby Agriculture Centers
  async getAgricultureCenters(
    type: string | null,
    lat: number | null,
    lon: number | null,
    radius: number
  ): Promise<CenterResponse[]> {
    let url = `${API_BASE_URL}/centers/?radius_km=${radius}`;
    if (type) url += `&center_type=${encodeURIComponent(type)}`;
    if (lat !== null && lon !== null) url += `&latitude=${lat}&longitude=${lon}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Agriculture centers fetch failed');
    return res.json();
  },

  // Voice Assistant STT -> Chatbot -> TTS
  async processVoice(audioBlob: Blob, lang: string): Promise<VoiceResponse> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice.wav');
    const res = await fetch(`${API_BASE_URL}/voice/process?lang=${lang}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Voice processing failed');
    return res.json();
  }
};
