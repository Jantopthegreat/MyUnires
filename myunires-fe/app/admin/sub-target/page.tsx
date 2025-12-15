"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "@/components/SidebarAdmin";
import { getUser } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

type SubTarget = {
  id: number;
  nama: string;
  target: string;
};

export default function SubTargetPage() {
  // proteksi role admin
  useAuth(["ADMIN"]);

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  // dummy data sub target
  const data: SubTarget[] = [
    { id: 1, nama: "Sub Target 1", target: "Target 1 - Target 2" },
    { id: 2, nama: "Sub Target 2", target: "Target 3 - Target 4" },
    { id: 3, nama: "Sub Target 3", target: "Target 5 - Target 6" },
    { id: 4, nama: "Sub Target 4", target: "Target 7 - Target 8" },
    { id: 5, nama: "Sub Target 5", target: "Target 9 - Target 12" },
    { id: 6, nama: "Sub Target 6", target: "Target 13 - Target 15" },
    { id: 7, nama: "Sub Target 7", target: "Target 16 - Target 17" },
    { id: 8, nama: "Sub Target 8", target: "Target 18 - Target 20" },
    { id: 9, nama: "Sub Target 9", target: "Target 21 - Target 22" },
    { id: 10, nama: "Sub Target 10", target: "Target 23 - Target 24" },
  ];

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">

      {/* SIDEBAR ADMIN */}
      <SidebarAdmin />

      {/* KONTEN KANAN */}
      <div className="ml-64 flex-1">

        {/* SUBHEADER HIJAU */}
        <div className="bg-[#004220] text-white py-6 px-10">
          <h1 className="text-xl font-semibold text-center">
            Kelola Sub Target
          </h1>

          {/* PROFILE ADMIN */}
          <div className="flex items-center mt-5">
            <div className="w-11 h-11 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user?.name || "Admin"}</p>
              <p className="text-sm opacity-90">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-10 py-8">

          {/* FILTER BAR */}
          <div className="flex flex-wrap items-center gap-3 mb-6">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Cari Sub Target"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-60"
            />

            {/* IMPORT */}
            <button className="border bg-white px-4 py-2 rounded-lg hover:bg-gray-100">
              Impor Data
            </button>

            {/* ADD */}
            <a
              href="/admin/sub-target/create"
              className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              + Add Sub Target
            </a>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border py-3">No</th>
                  <th className="border py-3">Sub Target</th>
                  <th className="border py-3">Target</th>
                  <th className="border py-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="text-center">
                    <td className="border py-3">{index + 1}</td>
                    <td className="border py-3">{item.nama}</td>
                    <td className="border py-3">{item.target}</td>
                    <td className="border py-3">
                      <div className="flex justify-center gap-4">
                        <a
                          href={`/admin/sub-target/${item.id}`}
                          className="text-green-700 hover:scale-110 transition"
                        >
                          👁
                        </a>
                        <a
                          href={`/admin/sub-target/edit/${item.id}`}
                          className="text-blue-700 hover:scale-110 transition"
                        >
                          ✏️
                        </a>
                        <button className="text-red-600 hover:scale-110 transition">
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-500"
                    >
                      Data tidak ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
