import Swal from "sweetalert2";

interface TahfidzData {
  id: number;
  residentId: number;
  resident: string;
  email: string;
  usroh: string | null;
  target: string;
  surah: string;
  status: string;
  nilaiHuruf: string | null;
  tanggal: string;
}

export const showTahfidzDetail = (data: TahfidzData) => {
  const tanggal = new Date(data.tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  Swal.fire({
    title: "Detail Nilai Tahfidz",
    html: `
      <div class="text-left space-y-2">
        <div class="mb-4 pb-4 border-b">
          <h3 class="font-bold text-lg mb-2">Data Resident</h3>
          <p><strong>Nama:</strong> ${data.resident}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Usroh:</strong> ${data.usroh || "-"}</p>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-2">Nilai Tahfidz</h3>
          <p><strong>Target Hafalan:</strong> ${data.target}</p>
          <p><strong>Surah:</strong> ${data.surah}</p>
          <p><strong>Status:</strong> 
            <span class="px-2 py-1 rounded text-xs font-semibold ml-2 ${
              data.status === "SELESAI"
                ? "bg-green-100 text-green-800"
                : data.status === "BELUM SELESAI"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }">
              ${data.status}
            </span>
          </p>
          <p><strong>Nilai Huruf:</strong> 
            <span class="px-2 py-1 rounded text-xs font-semibold ml-2 ${
              data.nilaiHuruf === "A"
                ? "bg-green-100 text-green-800"
                : data.nilaiHuruf === "B"
                ? "bg-blue-100 text-blue-800"
                : data.nilaiHuruf === "C"
                ? "bg-yellow-100 text-yellow-800"
                : data.nilaiHuruf === "D"
                ? "bg-orange-100 text-orange-800"
                : data.nilaiHuruf === "E"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }">
              ${data.nilaiHuruf || "Belum Dinilai"}
            </span>
          </p>
          <p><strong>Tanggal Penilaian:</strong> ${tanggal}</p>
        </div>
      </div>
    `,
    confirmButtonColor: "#0D6B44",
    width: "600px",
  });
};
