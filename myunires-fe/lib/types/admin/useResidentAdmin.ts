// src/types.ts

/**
 * Interface Resident yang lengkap, mencakup properti display (string)
 * dan properti relasi (ID number) yang diperlukan untuk filtering dan CRUD.
 */
export interface Resident {
  id: number;

  // Properti fungsional yang hilang (diperlukan untuk CRUD/Filtering di backend/hook)
  userId: number; // ID user yang terasosiasi (penting untuk API CRUD)
  noUnires: string; // Nomor Unires (sering digunakan sebagai identitas selain NIM)
  usrohId: number | null; // ID Usroh (digunakan untuk filtering di hook)
  lantaiId: number | null; // ID Lantai (digunakan untuk filtering di hook)

  // Properti Dasar & Display
  name: string;
  email: string;
  nim: string;
  jurusan: string;
  angkatan: number;
  noTelp: string; // string noTelp atau "-"

  // Properti Display (Nama dari relasi, bisa string atau "-")
  usroh: string; // Nama usroh
  lantai: string; // Nama lantai
  asrama?: string; // Menambahkan 'asrama' jika ada di respons API (dibuat opsional)
  
  createdAt: Date | string; 
}


/**
 * Interface Usroh dan Lantai untuk daftar (list) filter yang diambil dari API Admin.
 * Ini menggantikan alias type 'string' sebelumnya.
 */
export interface UsrohItem {
  id: number;
  nama: string; // Sesuai dengan field 'nama' di database Usroh
}

export interface LantaiItem {
  id: number;
  nama: string; // Sesuai dengan field 'nama' di database Lantai
}

// Export tipe untuk list
export type UsrohList = UsrohItem[];
export type LantaiList = LantaiItem[];