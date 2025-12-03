import React from "react";

export interface AssignmentData {
  id: number;
  materiId: number;
  judul: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawabanBenar: string;
  createdAt?: string;
  materi?: {
    id: number;
    judul: string;
    kategori: {
      id: number;
      nama: string;
    };
  };
}

interface AssignmentTableProps {
  filteredAssignments: AssignmentData[];
  handleView: (assignment: AssignmentData) => void;
  handleEdit: (assignment: AssignmentData) => void;
  handleDelete: (assignment: AssignmentData) => void;
  loading: boolean;
}

const AssignmentTable: React.FC<AssignmentTableProps> = ({
  filteredAssignments,
  handleView,
  handleEdit,
  handleDelete,
  loading,
}) => {
  return (
    <section className="px-6 pb-6">
      <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data...</div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Tidak ada data assignment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="text-[#004220] border-b border-[#004220] bg-white sticky top-0 z-10">
                  <tr>
                    <th className="py-3 text-left px-4 bg-white">No</th>
                    <th className="py-3 text-left px-4 bg-white">Judul</th>
                    <th className="py-3 text-left px-4 bg-white">Pertanyaan</th>
                    <th className="py-3 text-left px-4 bg-white">Materi</th>
                    <th className="py-3 text-left px-4 bg-white">Kategori</th>
                    <th className="py-3 text-center px-4 bg-white">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((assignment, i) => (
                    <tr
                      key={assignment.id}
                      className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
                    >
                      <td className="py-3 px-4">{i + 1}</td>
                      <td className="py-3 px-4">{assignment.judul}</td>
                      <td className="py-3 px-4">{assignment.pertanyaan}</td>
                      <td className="py-3 px-4">
                        {assignment.materi?.judul || "-"}
                      </td>
                      <td className="py-3 px-4">
                        {assignment.materi?.kategori?.nama || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleView(assignment)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(assignment)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold"
                          >
                            Delete
                          </button>
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
};

export default AssignmentTable;
