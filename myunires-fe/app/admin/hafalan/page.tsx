"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "@/components/SidebarAdmin";
import { getUser } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

type TargetHafalan = {
  id: number;
  target: string;
  surah: string;
};

export default function TargetHafalanPage() {
  // proteksi role admin
  useAuth(["ADMIN"]);

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [surah, setSurah] = useState("ALL");

  // dummy data target hafalan (sementara)
  const data: TargetHafalan[] = [
    { id: 1, target: "Target 1", surah: "An-Naba' 1-10" },
    { id: 2, target: "Target 2", surah: "An-Naba' 11-20" },
    { id: 3, target: "Target 3", surah: "An-Naba' 21-30" },
    { id: 4, target: "Target 4", surah: "An-Naba' 31-40" },
    { id: 5, target: "Target 5", surah: "An-Nazi'at 1-10" },
    { id: 6, target: "Target 6", surah: "An-Nazi'at 11-20" },
    { id: 7, target: "Target 7", surah: "An-Nazi'at 21-31" },
    { id: 8, target: "Target 8", surah: "An-Nazi'at 32-46" },
    { id: 9, target: "Target 9", surah: "'Abasa 1-11" },
    { id: 10, target: "Target 10", surah: "'Abasa 12-23" },
  ];

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const filteredData = data.filter((item) => {
    const cocokSearch = item.target
      .toLowerCase()
      .includes(search.toLowerCase());

    const cocokSurah = surah === "ALL" ? true : item.surah === surah;

    return cocokSearch && cocokSurah;
  });

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">

      {/* SIDEBAR ADMIN */}
      <SidebarAdmin />

      {/* KONTEN KANAN */}
      <div className="ml-64 flex-1">

        {/* SUBHEADER HIJAU */}
        <div className="bg-[#004220] text-white py-6 px-10">
          <h1 className="text-xl font-semibold text-center">
            Kelola Target Hafalan
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
              placeholder="Cari Target"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-60"
            />

            {/* FILTER SURAH */}
            <select
              value={surah}
              onChange={(e) => setSurah(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="ALL">Surah (All)</option>
              <option value="An-Naba' 1-10">An-Naba' 1-10</option>
              <option value="An-Naba' 11-20">An-Naba' 11-20</option>
              <option value="An-Naba' 21-30">An-Naba' 21-30</option>
              <option value="An-Naba' 31-40">An-Naba' 31-40</option>
              <option value="An-Nazi'at 1-10">An-Nazi'at 1-10</option>
              <option value="An-Nazi'at 11-20">An-Nazi'at 11-20</option>
              <option value="An-Nazi'at 21-31">An-Nazi'at 21-31</option>
              <option value="An-Nazi'at 32-46">An-Nazi'at 32-46</option>
              <option value="'Abasa 1-11">'Abasa 1-11</option>
              <option value="'Abasa 12-23">'Abasa 12-23</option>
            </select>

            {/* IMPORT */}
            <button className="border bg-white px-4 py-2 rounded-lg hover:bg-gray-100">
              Impor Data
            </button>

            {/* ADD */}
            <a
              href="/admin/hafalan/create"
              className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              + Add Target
            </a>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border py-3">No</th>
                  <th className="border py-3">Target</th>
                  <th className="border py-3">Surah</th>
                  <th className="border py-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="text-center">
                    <td className="border py-3">{index + 1}</td>
                    <td className="border py-3">{item.target}</td>
                    <td className="border py-3">{item.surah}</td>
                    <td className="border py-3">
                      <div className="flex justify-center gap-4">
                        <a
                          href={`/admin/target/${item.id}`}
                          className="text-green-700 hover:scale-110 transition"
                        >
                          👁
                        </a>
                        <a
                          href={`/admin/target/edit/${item.id}`}
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
