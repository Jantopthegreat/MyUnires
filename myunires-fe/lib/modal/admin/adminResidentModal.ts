// src/lib/residentModal.ts
import Swal from "sweetalert2";
import { apiPost, apiPut, apiDelete } from "@/lib/api"; 

// ==========================================================
// TIPE DATA LOKAL
// ==========================================================

export interface Resident {
  id: number;
  userId: number;
  name: string;
  email: string;
  nim: string;
  noUnires: string;
  jurusan: string;
  angkatan: number;
  usroh: string;
  usrohId: number | null;
  asrama: string;
  lantaiId: number | null;
  noTelp: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}


// ==========================================================
// A. TAMPILKAN DETAIL RESIDENT
// ==========================================================

export const showResidentDetail = (resident: Resident) => {
  Swal.fire({
    title: "Detail Resident",
    html: `
      <div class="text-left leading-relaxed">
        <p><strong>Nama:</strong> ${resident.name}</p>
        <p><strong>Email:</strong> ${resident.email}</p>
        <p><strong>NIM:</strong> ${resident.nim}</p>
        <p><strong>Jurusan:</strong> ${resident.jurusan}</p>
        <p><strong>Angkatan:</strong> ${resident.angkatan}</p>
        <p><strong>Usroh:</strong> ${resident.usroh}</p>
        <p><strong>Asrama:</strong> ${resident.asrama}</p>
        <p><strong>No. Telp:</strong> ${resident.noTelp || "-"}</p>
      </div>
    `,
    confirmButtonColor: "#0D6B44",
    width: 450,
  });
};


// ==========================================================
// B. TAMBAH / EDIT RESIDENT (CRUD: Create, Update)
// ==========================================================

/**
 * Menampilkan modal form untuk Tambah atau Edit Resident.
 * @param resident - Data resident yang akan diedit (opsional, jika kosong berarti Tambah).
 * @param usrohList - Daftar Usroh untuk dropdown.
 * @param lantaiList - Daftar Lantai untuk dropdown.
 * @returns Promise<boolean> - True jika operasi berhasil.
 */
export const showAddEditResidentModal = async (
  resident?: Resident,
  usrohList: { id: number; nama: string }[] = [],
  lantaiList: { id: number; nama: string }[] = []
): Promise<boolean> => {
  const isEdit = !!resident;
  const title = isEdit ? `Edit Data ${resident?.name}` : "Tambah Resident Baru";

  // Buat opsi dropdown HTML
  const usrohOptions = usrohList.map(u => 
    `<option value="${u.id}" ${resident?.usrohId === u.id ? 'selected' : ''}>${u.nama}</option>`
  ).join('');
  
  const lantaiOptions = lantaiList.map(l => 
    `<option value="${l.id}" ${resident?.lantaiId === l.id ? 'selected' : ''}>${l.nama}</option>`
  ).join('');

  const { value: formValues } = await Swal.fire({
    title,
    html: `
      <style>
        .swal2-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;}
      </style>
      <input id="swal-name" class="swal2-input" placeholder="Nama*" value="${resident?.name || ''}">
      <input id="swal-email" class="swal2-input" placeholder="Email*" value="${resident?.email || ''}">
      <input id="swal-password" type="password" class="swal2-input" placeholder="${isEdit ? 'Kosongkan jika tidak diubah' : 'Password* Wajib Diisi'}">
      <input id="swal-nim" class="swal2-input" placeholder="NIM*" value="${resident?.nim || ''}">
      
      <div class="swal2-input-grid">
        <input id="swal-jurusan" class="swal2-input" placeholder="Jurusan*" value="${resident?.jurusan || ''}">
        <input id="swal-angkatan" type="number" class="swal2-input" placeholder="Angkatan*" value="${resident?.angkatan || ''}">
      </div>

      <div class="swal2-input-grid">
        <select id="swal-usroh" class="swal2-select">
          <option value="">Pilih Usroh</option>
          ${usrohOptions}
        </select>
        <select id="swal-lantai" class="swal2-select">
          <option value="">Pilih Lantai</option>
          ${lantaiOptions}
        </select>
      </div>

      <input id="swal-notelp" class="swal2-input" placeholder="No. Telp" value="${resident?.noTelp || ''}">
      <input id="swal-noUnires" class="swal2-input" placeholder="No. Unires" value="${resident?.noUnires || ''}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isEdit ? "Simpan Perubahan" : "Tambahkan",
    confirmButtonColor: "#0D6B44",
    width: 600,
    
    preConfirm: () => {
        // Ambil dan trim nilai untuk semua field wajib
        const name = (document.getElementById('swal-name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('swal-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('swal-password') as HTMLInputElement).value.trim();
        const nim = (document.getElementById('swal-nim') as HTMLInputElement).value.trim();
        const jurusan = (document.getElementById('swal-jurusan') as HTMLInputElement).value.trim();
        const angkatanStr = (document.getElementById('swal-angkatan') as HTMLInputElement).value.trim();
        
        // Ambil nilai opsional / dropdown
        const usrohId = (document.getElementById('swal-usroh') as HTMLSelectElement).value;
        const lantaiIdStr = (document.getElementById('swal-lantai') as HTMLSelectElement).value;
        const noTelp = (document.getElementById('swal-notelp') as HTMLInputElement).value.trim();
        const noUnires = (document.getElementById('swal-noUnires') as HTMLInputElement).value.trim();

        // --- VALIDASI FRONTEND SINKRON DENGAN BACKEND ---
        
        if (!isEdit) {
            // MODE TAMBAH (Semua 6 field wajib di backend harus ada)
            if (!name || !email || !password || !nim || !jurusan || !angkatanStr) {
                Swal.showValidationMessage('Mode Tambah: Nama, Email, Password, NIM, Jurusan, dan Angkatan wajib diisi.');
                return false;
            }
        } else {
            // MODE EDIT (Tidak mewajibkan password, tapi yang lain tetap wajib)
            if (!name || !email || !nim || !jurusan || !angkatanStr) {
                Swal.showValidationMessage('Mode Edit: Nama, Email, NIM, Jurusan, dan Angkatan wajib diisi.');
                return false;
            }
        }
        
        // Validasi opsional (Jika Anda ingin Usroh wajib diisi di frontend)
        if (!usrohId) {
             Swal.showValidationMessage('Usroh wajib diisi.');
             return false;
        }

        // --- KEMBALIKAN DATA ---
        return {
          name,
          email,
          password: password || undefined, // Kirim undefined jika kosong di Edit, agar tidak mengubah password
          nim,
          jurusan,
          angkatan: Number(angkatanStr),
          usrohId: Number(usrohId) || null,
          lantaiId: Number(lantaiIdStr) || null,
          noTelp: noTelp || null,
          noUnires: noUnires || null,
        };
    }
  });

  if (formValues) {
    try {
      const dataToSend = { ...formValues };
      
      // Hapus password jika kosong (hanya relevan untuk PUT)
      if (isEdit && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      // Hapus field null/kosong yang tidak dibutuhkan di API (opsional, tapi bagus)
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === null || dataToSend[key] === "") {
            delete dataToSend[key];
        }
      });


      if (isEdit) {
        // PUT /api/admin/resident/:id
        const path = `/api/admin/resident/${resident!.id}`; // resident dipastikan ada di mode edit
        await apiPut<ApiResponse>(path, dataToSend); 
      } else {
        // POST /api/admin/resident
        await apiPost<ApiResponse>('/api/admin/resident', dataToSend);
      }
      
      Swal.fire('Berhasil!', `Data resident telah ${isEdit ? 'diperbarui' : 'ditambahkan'}.`, 'success');
      return true;
    } catch (error) {
      // Menangkap pesan error spesifik dari response API (jika API Anda mengembalikan pesan error di body)
      let errorMessage = 'Gagal menyimpan data resident. Cek koneksi server atau input data.';
      if (error && typeof error === 'object' && 'message' in error) {
          errorMessage = error.message as string;
      }
      
      console.error("Error saving resident:", error);
      Swal.fire('Gagal!', errorMessage, 'error');
      return false; 
    }
  }
  return false;
};


// ==========================================================
// C. HAPUS RESIDENT (CRUD: Delete)
// ==========================================================

export const confirmDeleteResident = async (resident: Resident): Promise<boolean> => {
  const result = await Swal.fire({
    title: "Anda Yakin?",
    text: `Data resident ${resident.name} (${resident.nim}) akan dihapus permanen.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545", 
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed) {
    try {
      // DELETE /api/admin/resident/:id
      const path = `/api/admin/resident/${resident.id}`;
      await apiDelete<ApiResponse>(path); 
      
      Swal.fire(
        "Dihapus!",
        `Resident ${resident.name} berhasil dihapus.`,
        "success"
      );
      return true;
    } catch (error) {
      console.error("Error deleteResident:", error);
      Swal.fire(
        "Gagal!",
        "Gagal menghapus resident. Pastikan koneksi server.",
        "error"
      );
      return false;
    }
  }
  return false;
};

// ==========================================================
// D. CATATAN: FUNGSI API PUT/DELETE
// ==========================================================
/* (Sama seperti sebelumnya) */