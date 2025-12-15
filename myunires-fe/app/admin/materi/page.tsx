"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "@/components/SidebarAdmin";
import { getUser } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

type Materi = {
  id: number;
  nama: string;
  kategori: string;
};

export default function MateriPage() {
  // proteksi role admin
  useAuth(["ADMIN"]);

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("ALL");

  // dummy data materi
  const data: Materi[] = [
    { id: 1, nama: "Materi 1", kategori: "Tafhim" },
    { id: 2, nama: "Materi 2", kategori: "Tafhim" },
    { id: 3, nama: "Materi 3", kategori: "Tafhim" },
    { id: 4, nama: "Materi 4", kategori: "Tahsin" },
    { id: 5, nama: "Materi 5", kategori: "Tahsin" },
    { id: 6, nama: "Materi 6", kategori: "Tahsin" },
    { id: 7, nama: "Materi 7", kategori: "Tahfidz" },
    { id: 8, nama: "Materi 8", kategori: "Kemuhammadiyahan" },
    { id: 9, nama: "Materi 9", kategori: "Kemuhammadiyahan" },
    { id: 10, nama: "Materi 10", kategori: "Kemuhammadiyahan" },
  ];

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const filteredData = data.filter((item) => {
    const cocokSearch = item.nama
      .toLowerCase()
      .includes(search.toLowerCase());

    const cocokKategori =
      kategori === "ALL" ? true : item.kategori === kategori;

    return cocokSearch && cocokKategori;
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
            Kelola Materi Pembelajaran
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
              placeholder="Cari Materi"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-60"
            />

            {/* FILTER KATEGORI */}
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="ALL">Kategori (All)</option>
              <option value="Tafhim">Tafhim</option>
              <option value="Tahsin">Tahsin</option>
              <option value="Tahfidz">Tahfidz</option>
              <option value="Kemuhammadiyahan">
                Kemuhammadiyahan
              </option>
            </select>

            {/* IMPORT */}
            <button className="border bg-white px-4 py-2 rounded-lg hover:bg-gray-100">
              Impor Data
            </button>

            {/* ADD */}
            <a
              href="/admin/materi/create"
              className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              + Add Materi
            </a>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border py-3">No</th>
                  <th className="border py-3">Materi</th>
                  <th className="border py-3">Kategori</th>
                  <th className="border py-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="text-center">
                    <td className="border py-3">{index + 1}</td>
                    <td className="border py-3">{item.nama}</td>
                    <td className="border py-3">{item.kategori}</td>
                    <td className="border py-3">
                      <div className="flex justify-center gap-4">
                        <a
                          href={`/admin/materi/${item.id}`}
                          className="text-green-700 hover:scale-110 transition"
                        >
                          👁
                        </a>
                        <a
                          href={`/admin/materi/edit/${item.id}`}
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
