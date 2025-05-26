// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, PatientData, SessionData } from '../constants/Types';
import { CONFIG } from './config';

const STORAGE_KEYS = {
  PATIENT_DATA: 'currentPatient',
  SESSION_HISTORY: 'sessionHistory',
  BLUETOOTH_DEVICE: 'lastBluetoothDevice',
  APP_SETTINGS: 'appSettings',
};

// Get current patient data
export const getPatientData = async (): Promise<PatientData | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PATIENT_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting patient data:', error);
    return null;
  }
};

// Save patient data
export const savePatientData = async (patient: Omit<PatientData, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const existingData = await getPatientData();
    const now = new Date().toISOString();
    
    const patientData: PatientData = {
      ...patient,
      createdAt: existingData?.createdAt || now,
      updatedAt: now,
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.PATIENT_DATA, JSON.stringify(patientData));
  } catch (error) {
    console.error('Error saving patient data:', error);
    throw error;
  }
};

// Delete patient data
export const deletePatientData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PATIENT_DATA);
  } catch (error) {
    console.error('Error deleting patient data:', error);
    throw error;
  }
};

// Get session history
export const getSessionHistory = async (): Promise<SessionData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting session history:', error);
    return [];
  }
};

// Add new session to history
export const addSessionToHistory = async (session: SessionData): Promise<void> => {
  try {
    const history = await getSessionHistory();
    
    // Add new session at the beginning
    const newHistory = [session, ...history];
    
    // Keep only the latest entries (max CONFIG.MAX_HISTORY_ENTRIES)
    const trimmedHistory = newHistory.slice(0, CONFIG.MAX_HISTORY_ENTRIES);
    
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error adding session to history:', error);
    throw error;
  }
};

// Get app settings
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : {
      lastKecepatan: CONFIG.DEFAULT_KECEPATAN,
      lastJarakLangkah: CONFIG.DEFAULT_JARAK,
    };
  } catch (error) {
    console.error('Error getting app settings:', error);
    return {
      lastKecepatan: CONFIG.DEFAULT_KECEPATAN,
      lastJarakLangkah: CONFIG.DEFAULT_JARAK,
    };
  }
};

// Save app settings
export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving app settings:', error);
    throw error;
  }
};

// Get last bluetooth device
export const getLastBluetoothDevice = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.BLUETOOTH_DEVICE);
  } catch (error) {
    console.error('Error getting last bluetooth device:', error);
    return null;
  }
};

// Save last bluetooth device
export const saveLastBluetoothDevice = async (deviceAddress: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BLUETOOTH_DEVICE, deviceAddress);
  } catch (error) {
    console.error('Error saving last bluetooth device:', error);
    throw error;
  }
};

// Format session data for display
export const formatSessionForDisplay = (session: SessionData): string => {
  return `📅 ${session.tanggal}, ${session.jam}\n👤 ${session.nama} (${session.gender.charAt(0)}, ${session.panjangKaki}cm)\n⏱️ Durasi: ${session.durasi}\n⚙️ Kecepatan: ${session.kecepatan}, Jarak: ${session.jarakLangkah}`;
};

// Format current time for session
export const getCurrentTimeString = (): string => {
  const now = new Date();
  return now.toTimeString().split(' ')[0]; // HH:MM:SS
};

// Format current date for session
export const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format duration from seconds to HH:MM:SS
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};