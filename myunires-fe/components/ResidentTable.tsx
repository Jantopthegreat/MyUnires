"use client";

interface Resident {
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

interface ResidentTableProps {
  residents: Resident[];
  loading: boolean;
  onViewDetail: (resident: Resident) => void;
}

export default function ResidentTable({
  residents,
  loading,
  onViewDetail,
}: ResidentTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden border border-[#004220]">
        <div className="text-center py-10 text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (residents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden border border-[#004220]">
        <div className="text-center py-10 text-gray-500">
          Tidak ada data resident
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-[#004220]">
      <table className="w-full text-sm border-collapse">
        <thead className="text-[#004220] border-b border-[#004220]">
          <tr>
            <th className="py-3 text-left px-4">No</th>
            <th className="py-3 text-left px-4">Nama</th>
            <th className="py-3 text-left px-4">No Unires</th>
            <th className="py-3 text-left px-4">Nama Usroh</th>
            <th className="py-3 text-left px-4">Asrama</th>
            <th className="py-3 text-center px-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {residents.map((r, i) => (
            <tr
              key={r.id}
              className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
            >
              <td className="py-3 px-4">{i + 1}</td>
              <td className="py-3 px-4">{r.name}</td>
              <td className="py-3 px-4">{r.nim}</td>
              <td className="py-3 px-4">{r.usroh}</td>
              <td className="py-3 px-4">{r.asrama}</td>
              <td className="py-3 px-4 text-center">
                <button onClick={() => onViewDetail(r)}>
                  <img
                    src="/eye_icon.svg"
                    alt="view"
                    className="h-5 mx-auto cursor-pointer hover:opacity-70 transition"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
