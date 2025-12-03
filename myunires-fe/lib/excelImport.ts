import { getToken } from "@/lib/api";
import Swal from "sweetalert2";

export const handleExcelImport = async (
  file: File,
  onSuccess?: () => void
) => {
  // Validasi file type
  if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
    Swal.fire({
      icon: "warning",
      title: "Format File Salah",
      text: "Harap upload file Excel (.xlsx atau .xls)",
    });
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  // Show loading
  Swal.fire({
    title: "Memproses...",
    text: "Sedang mengimport data, mohon tunggu",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const token = getToken();
    const response = await fetch(
      "http://localhost:3001/api/musyrif/residents/import",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const result = await response.json();

    console.log("📊 Import result:", result);

    if (result.success) {
      const hasErrors = result.errors && result.errors.length > 0;

      // Log errors to console for debugging
      if (hasErrors) {
        console.error("❌ Import Errors Detail:");
        console.table(result.errors);
      }

      // Show detailed result
      await Swal.fire({
        icon: result.imported > 0 ? "success" : "error",
        title: result.imported > 0 ? "Import Selesai!" : "Import Gagal",
        html: `
          <div class="text-left space-y-2">
            <p class="font-semibold text-lg">${result.message}</p>
            <div class="mt-4 p-3 bg-gray-100 rounded">
              <p>✅ <strong>Berhasil:</strong> ${result.imported} data</p>
              <p>❌ <strong>Gagal:</strong> ${
                hasErrors ? result.errors.length : 0
              } data</p>
              <p>📊 <strong>Total:</strong> ${result.total} data</p>
            </div>
            ${
              hasErrors
                ? `
              <div class="mt-4">
                <p class="text-red-600 font-semibold mb-2">Detail Error:</p>
                <div class="max-h-40 overflow-y-auto text-sm bg-red-50 p-2 rounded">
                  ${result.errors
                    .map(
                      (err: any) =>
                        `<p class="mb-1">
                          <span class="font-bold">Baris ${err.row}:</span> ${err.error}
                        </p>`
                    )
                    .join("")}
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  💡 Tip: Cek console browser (F12) untuk detail lengkap
                </p>
              </div>
            `
                : ""
            }
          </div>
        `,
        width: "600px",
        confirmButtonColor: "#0D6B44",
      });

      // Refresh data jika ada yang berhasil
      if (result.imported > 0 && onSuccess) {
        onSuccess();
      }
    } else {
      throw new Error(result.message);
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    Swal.fire({
      icon: "error",
      title: "Import Gagal",
      html: `
        <p>${error.message || "Terjadi kesalahan saat import data"}</p>
        <div class="mt-4 p-3 bg-red-50 rounded text-left text-sm">
          <p class="font-semibold">Kemungkinan Penyebab:</p>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li>Nama kolom Excel tidak sesuai (harus: name, email, password, nim)</li>
            <li>Ada field wajib yang kosong</li>
            <li>Email sudah terdaftar</li>
            <li>Format file bukan .xlsx atau .xls</li>
            <li>Backend tidak running</li>
          </ul>
          <p class="mt-3 text-xs text-gray-600">
            📖 Lihat file PANDUAN_IMPORT_RESIDENT.md untuk detail lengkap
          </p>
        </div>
      `,
      width: "600px",
      confirmButtonColor: "#0D6B44",
    });
  }
};
