// utils/bluetooth.ts (Updated for react-native-bluetooth-classic)
import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { BluetoothStatus } from '../constants/Types';
import { CONFIG } from './config';

export class BluetoothManager {
  private device: BluetoothDevice | null = null;
  private reconnectTimer: any = null;
  private isConnecting = false;
  private connectionStatus: BluetoothStatus = 'disconnected';
  
  // Event listeners
  private onStatusChangeCallback: ((status: BluetoothStatus) => void) | null = null;
  private onMessageCallback: ((message: string) => void) | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Request permissions for Android
      if (Platform.OS === 'android') {
        await this.requestBluetoothPermissions();
      }
      
      // Check if bluetooth is enabled
      const isEnabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!isEnabled) {
        await RNBluetoothClassic.requestBluetoothEnabled();
      }
      
      console.log('Bluetooth Manager initialized');
      this.updateStatus('disconnected');
      
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
    }
  }

  // Request Bluetooth permissions for Android
  private async requestBluetoothPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        return Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  // Set status change callback
  setOnStatusChange(callback: (status: BluetoothStatus) => void) {
    this.onStatusChangeCallback = callback;
  }

  // Set message received callback
  setOnMessage(callback: (message: string) => void) {
    this.onMessageCallback = callback;
  }

  // Scan for GETO devices
  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      console.log('Scanning for Bluetooth devices...');
      
      // Check permissions first
      const hasPermissions = await this.requestBluetoothPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted');
      }

      // Start discovery
      const discovering = await RNBluetoothClassic.startDiscovery();
      if (!discovering) {
        throw new Error('Unable to start discovery');
      }
      
      // Wait for discovery to complete
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Get discovered and bonded devices
      const unpairedDevices = await RNBluetoothClassic.getDiscoveredDevices();
      const pairedDevices = await RNBluetoothClassic.getBondedDevices();
      
      // Combine and filter for ESP32/GETO devices
      const allDevices = [...unpairedDevices, ...pairedDevices];
      const getoDevices = allDevices.filter((device: BluetoothDevice) => 
        device.name && (
          device.name.toUpperCase().includes('GETO') || 
          device.name.toUpperCase().includes('ESP32') ||
          device.name.toUpperCase().includes('HC-05') ||
          device.name.toUpperCase().includes('HC-06')
        )
      );
      
      console.log('Found GETO devices:', getoDevices);
      return getoDevices;
      
    } catch (error) {
      console.error('Scan error:', error);
      return [];
    }
  }

  // Connect to device
  async connectToDevice(deviceId: string): Promise<boolean> {
    if (this.isConnecting) return false;
    
    try {
      this.isConnecting = true;
      this.updateStatus('connecting');
      
      console.log('Connecting to device:', deviceId);
      
      // Disconnect from any existing connection
      if (this.device) {
        await this.device.disconnect();
      }
      
      // Connect to the device
      this.device = await RNBluetoothClassic.connectToDevice(deviceId);
      
      if (this.device && this.device.isConnected()) {
        // Set up data listener
        this.device.onDataReceived((data) => {
          if (this.onMessageCallback) {
            this.onMessageCallback(data.data);
          }
        });

        this.updateStatus('connected');
        this.startHeartbeat();
        console.log('Connected successfully to:', deviceId);
        return true;
      } else {
        this.updateStatus('disconnected');
        console.log('Failed to connect to:', deviceId);
        return false;
      }
      
    } catch (error) {
      console.error('Connection error:', error);
      this.updateStatus('disconnected');
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  // Disconnect from device
  async disconnect(): Promise<void> {
    try {
      console.log('Disconnecting from device...');
      
      if (this.device) {
        await this.device.disconnect();
        this.device = null;
      }
      
      this.stopReconnect();
      this.updateStatus('disconnected');
      console.log('Disconnected successfully');
      
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  // Send command to device
  async sendCommand(command: string): Promise<boolean> {
    if (!this.device || !this.isConnected()) {
      throw new Error('Device not connected');
    }

    try {
      console.log('Sending command to ESP32:', command);
      
      // Send command to ESP32
      const success = await this.device.write(command + '\n');
      
      if (success) {
        // Wait for response with timeout
        return await this.waitForResponse();
      }
      
      return false;
      
    } catch (error) {
      console.error('Send command error:', error);
      throw error;
    }
  }

  // Wait for device response
  private async waitForResponse(): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('Command timeout - no response from ESP32');
        resolve(false);
      }, CONFIG.COMMAND_TIMEOUT);

      const originalCallback = this.onMessageCallback;
      this.onMessageCallback = (message: string) => {
        clearTimeout(timeout);
        this.onMessageCallback = originalCallback;
        
        console.log('Received response from ESP32:', message);
        
        // Check if response indicates success
        const isSuccess = message.includes('OK') || message.includes('SUCCESS');
        resolve(isSuccess);
        
        // Call original callback if exists
        if (originalCallback) {
          originalCallback(message);
        }
      };
    });
  }

  // Check if device is connected
  isConnected(): boolean {
    return this.device !== null && this.device.isConnected();
  }

  // Get connected device info
  getDeviceInfo(): BluetoothDevice | null {
    return this.device;
  }

  // Start auto-reconnect
  startAutoReconnect(deviceId: string) {
    this.stopReconnect();
    
    console.log('Starting auto-reconnect for device:', deviceId);
    
    this.reconnectTimer = setInterval(async () => {
      if (!this.isConnected() && !this.isConnecting) {
        console.log('Attempting auto-reconnect...');
        await this.connectToDevice(deviceId);
      }
    }, CONFIG.RECONNECT_INTERVAL);
  }

  // Stop auto-reconnect
  stopReconnect() {
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer);
      this.reconnectTimer = null;
      console.log('Auto-reconnect stopped');
    }
  }

  // Start heartbeat to check connection
  private startHeartbeat() {
    setInterval(async () => {
      if (this.device && this.isConnected()) {
        try {
          // Send heartbeat to check if connection is still alive
          await this.device.write('PING\n');
        } catch (error) {
          console.log('Heartbeat failed - connection lost');
          this.device = null;
          this.updateStatus('disconnected');
        }
      }
    }, 30000); // Every 30 seconds
  }

  // Update connection status
  private updateStatus(status: BluetoothStatus) {
    this.connectionStatus = status;
    console.log('Bluetooth status changed to:', status);
    
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  // Get list of paired devices
  async getPairedDevices(): Promise<BluetoothDevice[]> {
    try {
      const devices = await RNBluetoothClassic.getBondedDevices();
      return devices.filter((device: BluetoothDevice) => 
        device.name && (
          device.name.toUpperCase().includes('GETO') || 
          device.name.toUpperCase().includes('ESP32') ||
          device.name.toUpperCase().includes('HC-05') ||
          device.name.toUpperCase().includes('HC-06')
        )
      );
    } catch (error) {
      console.error('Get paired devices error:', error);
      return [];
    }
  }

  // Cleanup
  destroy() {
    this.stopReconnect();
    this.disconnect();
  }
}

// Singleton instance
export const bluetoothManager = new BluetoothManager();

// Helper functions for sending specific commands
export const sendStartCommand = async (): Promise<boolean> => {
  return await bluetoothManager.sendCommand('START');
};

export const sendStopCommand = async (): Promise<boolean> => {
  return await bluetoothManager.sendCommand('STOP');
};

export const sendResetCommand = async (): Promise<boolean> => {
  return await bluetoothManager.sendCommand('RESET');
};

export const sendGaitCommand = async (jarak: number, kecepatan: number): Promise<boolean> => {
  return await bluetoothManager.sendCommand(`SET_GAIT ${jarak} ${kecepatan}`);
};