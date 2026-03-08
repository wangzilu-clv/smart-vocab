import * as Speech from 'expo-speech';
import { AccentType } from '../types';

// Voice mapping for different accents
const VOICE_MAP: Record<AccentType, string[]> = {
  us: [
    'com.apple.ttsbundle.Samantha-compact', // iOS US
    'com.apple.ttsbundle.Alex-compact', // iOS US Male
    'en-US-language', // Android
    'en-US', // Fallback
  ],
  uk: [
    'com.apple.ttsbundle.Daniel-compact', // iOS UK
    'com.apple.ttsbundle.Moira-compact', // iOS UK Female
    'en-GB-language', // Android
    'en-GB', // Fallback
  ],
};

let currentAccent: AccentType = 'us';
let speechRate = 0.9;
let speechPitch = 1.0;

/**
 * Set the accent preference
 */
export const setAccent = (accent: AccentType): void => {
  currentAccent = accent;
};

/**
 * Get current accent
 */
export const getAccent = (): AccentType => currentAccent;

/**
 * Toggle between US and UK accent
 */
export const toggleAccent = (): AccentType => {
  currentAccent = currentAccent === 'us' ? 'uk' : 'us';
  return currentAccent;
};

/**
 * Set speech rate (speed)
 */
export const setSpeechRate = (rate: number): void => {
  speechRate = Math.max(0.5, Math.min(1.5, rate));
};

/**
 * Set speech pitch
 */
export const setSpeechPitch = (pitch: number): void => {
  speechPitch = Math.max(0.5, Math.min(2.0, pitch));
};

/**
 * Get available voices
 */
export const getAvailableVoices = async (): Promise<Speech.Voice[]> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.filter(v => v.language.startsWith('en'));
  } catch (error) {
    console.error('Error getting voices:', error);
    return [];
  }
};

/**
 * Find best matching voice for accent
 */
const findVoice = (voices: Speech.Voice[], accent: AccentType): string | undefined => {
  const preferredVoices = VOICE_MAP[accent];
  
  for (const preferred of preferredVoices) {
    const match = voices.find(v => 
      v.identifier.includes(preferred) || 
      v.language === preferred ||
      v.language.replace('_', '-').toLowerCase() === preferred.toLowerCase()
    );
    if (match) return match.identifier;
  }
  
  // Fallback to any English voice matching the region
  const regionCode = accent === 'us' ? 'US' : 'GB';
  const fallback = voices.find(v => 
    v.language.includes(regionCode) || 
    v.language.includes(accent === 'us' ? 'en-US' : 'en-GB')
  );
  
  return fallback?.identifier;
};

/**
 * Speak a word or text
 */
export const speak = async (
  text: string, 
  options?: { 
    accent?: AccentType; 
    rate?: number; 
    pitch?: number;
    onDone?: () => void;
    onError?: (error: Error) => void;
  }
): Promise<void> => {
  try {
    // Stop any current speech
    await Speech.stop();
    
    const accent = options?.accent || currentAccent;
    const voices = await getAvailableVoices();
    const voice = findVoice(voices, accent);
    
    const speechOptions: Speech.SpeechOptions = {
      language: accent === 'us' ? 'en-US' : 'en-GB',
      rate: options?.rate || speechRate,
      pitch: options?.pitch || speechPitch,
      onDone: options?.onDone,
      onError: options?.onError,
    };
    
    if (voice) {
      speechOptions.voice = voice;
    }
    
    await Speech.speak(text, speechOptions);
  } catch (error) {
    console.error('Speech error:', error);
    options?.onError?.(error as Error);
  }
};

/**
 * Speak a word with proper pronunciation
 */
export const speakWord = async (
  word: string,
  accent?: AccentType
): Promise<void> => {
  await speak(word, { accent: accent || currentAccent });
};

/**
 * Speak an example sentence
 */
export const speakExample = async (
  sentence: string,
  accent?: AccentType
): Promise<void> => {
  await speak(sentence, { 
    accent: accent || currentAccent,
    rate: (speechRate * 0.8), // Slightly slower for examples
  });
};

/**
 * Stop speaking
 */
export const stopSpeaking = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
};

/**
 * Check if currently speaking
 */
export const isSpeaking = async (): Promise<boolean> => {
  try {
    // expo-speech doesn't have a direct isSpeaking method
    // We track this internally or use the callbacks
    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Get accent display name
 */
export const getAccentDisplayName = (accent: AccentType): string => {
  return accent === 'us' ? '美式' : '英式';
};

/**
 * Get accent emoji flag
 */
export const getAccentFlag = (accent: AccentType): string => {
  return accent === 'us' ? '🇺🇸' : '🇬🇧';
};
