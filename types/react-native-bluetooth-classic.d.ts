// types/react-native-bluetooth-classic.d.ts
declare module 'react-native-bluetooth-classic' {
  export interface BluetoothDevice {
    id: string;
    name: string;
    address: string;
    bonded?: boolean;
    deviceClass?: number;
    rssi?: number;
    
    // Connection methods
    isConnected(): boolean;
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    
    // Data methods
    write(data: string): Promise<boolean>;
    read(): Promise<string>;
    available(): Promise<number>;
    clear(): Promise<boolean>;
    
    // Event methods
    onDataReceived(callback: (data: { data: string }) => void): void;
    removeDataReceivedListener(): void;
  }

  export interface BluetoothModule {
    // Bluetooth state
    isBluetoothEnabled(): Promise<boolean>;
    requestBluetoothEnabled(): Promise<boolean>;
    
    // Device discovery
    startDiscovery(): Promise<boolean>;
    cancelDiscovery(): Promise<boolean>;
    getDiscoveredDevices(): Promise<BluetoothDevice[]>;
    getBondedDevices(): Promise<BluetoothDevice[]>;
    
    // Connection
    connectToDevice(deviceId: string): Promise<BluetoothDevice>;
    disconnect(): Promise<boolean>;
    getConnectedDevices(): Promise<BluetoothDevice[]>;
    getConnectedDevice(deviceId: string): Promise<BluetoothDevice | null>;
    
    // Events
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback?: (...args: any[]) => void): void;
    removeAllListeners(event?: string): void;
  }

  const RNBluetoothClassic: BluetoothModule;
  export default RNBluetoothClassic;
}