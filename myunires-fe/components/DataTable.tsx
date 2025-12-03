import React from "react";

interface ResidentWithUsroh {
  id: number;
  name: string;
  nim: string;
  usrohId: number | null;
  usroh: string | null;
}

interface DataTableProps {
  filteredData: ResidentWithUsroh[];
  handleViewResident: (resident: ResidentWithUsroh) => void;
  loading: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  filteredData,
  handleViewResident,
  loading,
}) => {
  return (
    <section className="px-6 pb-6">
      <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Tidak ada data resident
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="text-[#004220] border-b border-[#004220] bg-white sticky top-0 z-10">
                  <tr>
                    <th className="py-3 text-left px-4 bg-white">No</th>
                    <th className="py-3 text-left px-4 bg-white">Nama</th>
                    <th className="py-3 text-left px-4 bg-white">No. Unires</th>
                    <th className="py-3 text-left px-4 bg-white">Usroh</th>
                    <th className="py-3 text-center px-4 bg-white">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((resident, i) => (
                    <tr
                      key={resident.id}
                      className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
                    >
                      <td className="py-3 px-4">{i + 1}</td>
                      <td className="py-3 px-4">{resident.name}</td>
                      <td className="py-3 px-4">{resident.nim}</td>
                      <td className="py-3 px-4">{resident.usroh || "-"}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewResident(resident)}
                            className="flex items-center gap-2 bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold"
                          >
                            Lihat Detail
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

export default DataTable;
