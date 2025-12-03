import Swal from "sweetalert2";
import { API_BASE } from "./api";

export const handleTahfidzImport = async (file: File) => {
  if (!file) {
    Swal.fire("Error", "Silakan pilih file terlebih dahulu", "error");
    return;
  }

  // Validate file extension
  const allowedExtensions = [".xlsx", ".xls"];
  const fileExtension = file.name.substring(file.name.lastIndexOf("."));
  if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
    Swal.fire(
      "Error",
      "Format file tidak valid. Gunakan file Excel (.xlsx atau .xls)",
      "error"
    );
    return;
  }

  // Show loading modal
  Swal.fire({
    title: "Mengimpor Data",
    html: "Mohon tunggu, sedang memproses file Excel...",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/musyrif/tahfidz/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.success) {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        html: `
          <div class="text-left">
            <p><strong>Berhasil diimpor:</strong> ${result.successCount} data</p>
            ${
              result.skippedCount > 0
                ? `<p class="text-yellow-600"><strong>Dilewati:</strong> ${result.skippedCount} data</p>`
                : ""
            }
          </div>
        `,
        confirmButtonColor: "#0D6B44",
      }).then(() => {
        // Reload page to refresh data
        window.location.reload();
      });
    } else {
      // Handle validation errors
      if (result.errors && result.errors.length > 0) {
        const errorList = result.errors
          .slice(0, 10) // Show max 10 errors
          .map((err: any) => `<li>Baris ${err.row}: ${err.message}</li>`)
          .join("");

        const remainingErrors =
          result.errors.length > 10 ? result.errors.length - 10 : 0;

        Swal.fire({
          icon: "error",
          title: "Import Gagal",
          html: `
            <div class="text-left">
              <p class="mb-2"><strong>Ditemukan ${result.errors.length} error:</strong></p>
              <ul class="list-disc list-inside max-h-60 overflow-y-auto">
                ${errorList}
              </ul>
              ${
                remainingErrors > 0
                  ? `<p class="mt-2 text-sm text-gray-600">... dan ${remainingErrors} error lainnya</p>`
                  : ""
              }
              <p class="mt-4 text-sm text-gray-700">
                Silakan perbaiki file Excel Anda dan coba lagi.
              </p>
            </div>
          `,
          width: "600px",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Import Gagal",
          text: result.message || "Terjadi kesalahan saat mengimpor data",
        });
      }
    }
  } catch (error) {
    console.error("Import error:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Gagal menghubungi server. Pastikan backend berjalan.",
    });
  }
};
