import React from "react";

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
  ayatMulai: number;
  ayatAkhir: number;
  status: string;
  nilaiHuruf: string | null;
  tanggal: string;
  targetHafalanId: number;
}

export default function RevisiNilaiTable({
  nilaiList,
  loading,
  handleViewDetail,
  handleEdit,
}: {
  nilaiList: NilaiTahfidzData[];
  loading: boolean;
  handleViewDetail: (nilai: NilaiTahfidzData) => void;
  handleEdit: (nilai: NilaiTahfidzData) => void;
}) {
  return (
    <section className="px-6 pb-6">
      <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data...</div>
        ) : nilaiList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Belum ada data nilai tahfidz untuk resident ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="text-[#004220] border-b border-[#004220] bg-white sticky top-0 z-10">
                  <tr>
                    <th className="py-3 text-left px-4 bg-white">No</th>
                    <th className="py-3 text-left px-4 bg-white">Target</th>
                    <th className="py-3 text-left px-4 bg-white">Surah</th>
                    <th className="py-3 text-left px-4 bg-white">Ayat</th>
                    <th className="py-3 text-left px-4 bg-white">Status</th>
                    <th className="py-3 text-left px-4 bg-white">Nilai</th>
                    <th className="py-3 text-center px-4 bg-white">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {nilaiList.map((nilai, i) => (
                    <tr
                      key={nilai.id}
                      className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
                    >
                      <td className="py-3 px-4">{i + 1}</td>
                      <td className="py-3 px-4">{nilai.target}</td>
                      <td className="py-3 px-4">{nilai.surah}</td>
                      <td className="py-3 px-4">
                        {nilai.ayatMulai} - {nilai.ayatAkhir}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            nilai.status === "SELESAI"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {nilai.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            nilai.nilaiHuruf === "A" ||
                            nilai.nilaiHuruf === "A-"
                              ? "bg-green-100 text-green-800"
                              : nilai.nilaiHuruf?.startsWith("B")
                              ? "bg-blue-100 text-blue-800"
                              : nilai.nilaiHuruf?.startsWith("C")
                              ? "bg-yellow-100 text-yellow-800"
                              : nilai.nilaiHuruf === "D"
                              ? "bg-orange-100 text-orange-800"
                              : nilai.nilaiHuruf === "E"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {nilai.nilaiHuruf || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <img
                            src="/eye_icon.svg"
                            alt="view"
                            className="h-5 w-5 cursor-pointer hover:opacity-70 transition"
                            onClick={() => handleViewDetail(nilai)}
                          />
                          <img
                            src="/edit.svg"
                            alt="edit"
                            className="h-5 w-5 cursor-pointer hover:opacity-70 transition"
                            onClick={() => handleEdit(nilai)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
