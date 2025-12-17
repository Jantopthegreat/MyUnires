"use client";

import type { Resident } from "@/types/resident";

interface ResidentTableProps {
  residents: Resident[];
  loading: boolean;
  onViewDetail: (resident: Resident) => void;
  onEdit?: (resident: Resident) => void;
  onDelete?: (resident: Resident) => void;
}

export default function ResidentTable({
  residents,
  loading,
  onViewDetail,
  onEdit,
  onDelete,
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
              <td className="py-3 px-4">{r.nim || r.uniresNumber}</td>
              <td className="py-3 px-4">{r.usroh || r.usrohName}</td>
              <td className="py-3 px-4">{r.asrama || "-"}</td>
              <td className="py-3 px-4">{r.asrama || "-"}</td>
              <td className="py-3 px-4 text-center">
                <button onClick={() => onViewDetail(r)}>
                  <img
                    src="/eye_icon.svg"
                    alt="view"
                    className="h-5 mx-auto cursor-pointer hover:opacity-70 transition"
                  />
                </button>
                {onEdit && (
                  <button onClick={() => onEdit(r)} className="ml-2">
                    <img
                      src="/edit_icon.svg"
                      alt="edit"
                      className="h-5 mx-auto cursor-pointer hover:opacity-70 transition"
                    />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(r)} className="ml-2">
                    <img
                      src="/delete_icon.svg"
                      alt="delete"
                      className="h-5 mx-auto cursor-pointer hover:opacity-70 transition"
                    />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
