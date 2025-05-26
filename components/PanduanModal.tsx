// components/PanduanModal.tsx
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../constants/Colors';

interface PanduanModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PanduanModal: React.FC<PanduanModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>PANDUAN PENGGUNAAN GETO</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. PERSIAPAN</Text>
            <Text style={styles.sectionText}>
              • Pastikan alat GETO sudah dinyalakan{'\n'}
              • Aktifkan Bluetooth di smartphone{'\n'}
              • Buka aplikasi dan tunggu koneksi otomatis
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. MENU HOME</Text>
            <Text style={styles.sectionText}>
              • Isi data pasien dengan lengkap{'\n'}
              • Nama minimal 2 karakter{'\n'}
              • Pilih jenis kelamin{'\n'}
              • Panjang kaki antara 30-70 cm{'\n'}
              • Tekan SIMPAN untuk menyimpan data{'\n'}
              • EDIT: Ubah data pasien yang sudah tersimpan{'\n'}
              • HAPUS: Hapus semua data pasien
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. MENU KONTROL</Text>
            <Text style={styles.sectionText}>
              • KECEPATAN: Atur kecepatan motor (1-100){'\n'}
              • JARAK LANGKAH: Atur jarak gerakan (1-100){'\n'}
              • START: Mulai sesi terapi fisioterapi{'\n'}
              • STOP: Hentikan sesi terapi{'\n'}
              • RESET: Reset pengaturan ke posisi awal{'\n'}
              • TIMER: Menunjukkan durasi sesi berjalan{'\n'}
              • STATUS: Menampilkan kondisi alat saat ini
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. RIWAYAT PENGGUNAAN</Text>
            <Text style={styles.sectionText}>
              • Menyimpan 10 sesi terapi terakhir{'\n'}
              • Menampilkan: tanggal, jam, durasi, pengaturan{'\n'}
              • Data pasien yang digunakan saat itu{'\n'}
              • Scroll ke bawah untuk melihat riwayat lama
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. STATUS KONEKSI</Text>
            <Text style={styles.sectionText}>
              • Indikator di pojok kanan atas{'\n'}
              • Hijau: Terhubung dengan alat{'\n'}
              • Merah: Terputus, tap untuk reconnect{'\n'}
              • Aplikasi akan otomatis reconnect
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. KEAMANAN</Text>
            <Text style={styles.sectionText}>
              • Tombol STOP tersedia untuk menghentikan sesi{'\n'}
              • Pastikan koneksi Bluetooth stabil sebelum memulai{'\n'}
              • Periksa pengaturan sebelum menekan START
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});