"use client";

export interface NilaiTahfidzData {
  id: number;
  residentId: number;
  resident: string;
  nim: string;
  email: string;
  usroh: string | null;
  usrohId: number | null;
  target: string;
  surah: string;
  status: string;
  nilaiHuruf: string | null;
  tanggal: string;
  targetHafalanId: number;
}

interface TahfidzTableProps {
  data: NilaiTahfidzData[];
  loading: boolean;
  onViewDetail: (data: NilaiTahfidzData) => void;
  onEdit: (data: NilaiTahfidzData) => void;
}

export default function TahfidzTable({
  data,
  loading,
  onViewDetail,
  onEdit,
}: TahfidzTableProps) {
  if (loading) {
    return (
      <section className="px-6">
        <div className="bg-white rounded-lg shadow overflow-hidden border border-[#004220]">
          <div className="text-center py-10 text-gray-500">Memuat data...</div>
        </div>
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className="px-6">
        <div className="bg-white rounded-lg shadow overflow-hidden border border-[#004220]">
          <div className="text-center py-10 text-gray-500">
            Tidak ada data nilai tahfidz
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6">
      <div className="bg-white rounded-lg shadow overflow-hidden border border-[#004220]">
        <table className="w-full text-sm border-collapse">
          <thead className="text-[#004220] border-b border-[#004220]">
            <tr>
              <th className="py-3 text-left px-4">No</th>
              <th className="py-3 text-left px-4">Nama</th>
              <th className="py-3 text-left px-4">No Unires</th>
              <th className="py-3 text-left px-4">Usroh</th>
              <th className="py-3 text-left px-4">Nilai</th>
              <th className="py-3 text-center px-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr
                key={r.id}
                className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
              >
                <td className="py-3 px-4">{i + 1}</td>
                <td className="py-3 px-4">{r.resident}</td>
                <td className="py-3 px-4">{r.nim}</td>
                <td className="py-3 px-4">{r.usroh || "-"}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      r.nilaiHuruf === "A" || r.nilaiHuruf === "A-"
                        ? "bg-green-100 text-green-800"
                        : r.nilaiHuruf?.startsWith("B")
                        ? "bg-blue-100 text-blue-800"
                        : r.nilaiHuruf?.startsWith("C")
                        ? "bg-yellow-100 text-yellow-800"
                        : r.nilaiHuruf === "D"
                        ? "bg-orange-100 text-orange-800"
                        : r.nilaiHuruf === "E"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {r.nilaiHuruf || "-"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => onViewDetail(r)}>
                      <img
                        src="/eye_icon.svg"
                        alt="view"
                        className="h-5 mx-auto cursor-pointer hover:opacity-70 transition"
                      />
                    </button>
                    <button onClick={() => onEdit(r)}>
                      <img
                        src="/edit.svg"
                        alt="edit"
                        className="h-5 mx-auto cursor-pointer hover:opacity-70 transition"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
