"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "@/components/SidebarAdmin";
import { getUser } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

type Asrama = {
  id: number;
  gedung: string;
  lantai: string;
  usroh: string;
};

export default function AsramaPage() {
  // proteksi role admin
  useAuth(["ADMIN"]);

  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [gedung, setGedung] = useState("ALL");
  const [lantai, setLantai] = useState("ALL");
  const [usroh, setUsroh] = useState("ALL");

  // dummy data asrama
  const data: Asrama[] = [
    { id: 1, gedung: "Gedung Putra", lantai: "Lantai 1", usroh: "Abu Bakar Ash-Shiddiq" },
    { id: 2, gedung: "Gedung Putra", lantai: "Lantai 2", usroh: "Abu Bakar Ash-Shiddiq" },
    { id: 3, gedung: "Gedung Putra", lantai: "Lantai 3", usroh: "Umar bin Khattab" },
    { id: 4, gedung: "Gedung Putra", lantai: "Lantai 4", usroh: "Umar bin Khattab" },
    { id: 5, gedung: "Gedung Putri", lantai: "Lantai 1", usroh: "Khadijah binti Khuwailid" },
    { id: 6, gedung: "Gedung Putri", lantai: "Lantai 2", usroh: "Khadijah binti Khuwailid" },
    { id: 7, gedung: "Gedung Putri", lantai: "Lantai 3", usroh: "Aisyah binti Abu Bakar" },
    { id: 8, gedung: "Gedung Putri", lantai: "Lantai 4", usroh: "Aisyah binti Abu Bakar" },
  ];

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const filteredData = data.filter((item) => {
    const cocokSearch =
      item.gedung.toLowerCase().includes(search.toLowerCase()) ||
      item.usroh.toLowerCase().includes(search.toLowerCase());

    const cocokGedung = gedung === "ALL" ? true : item.gedung === gedung;
    const cocokLantai = lantai === "ALL" ? true : item.lantai === lantai;
    const cocokUsroh = usroh === "ALL" ? true : item.usroh === usroh;

    return cocokSearch && cocokGedung && cocokLantai && cocokUsroh;
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
            Kelola Asrama
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
              placeholder="Cari Data"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-60"
            />

            {/* FILTER GEDUNG */}
            <select
              value={gedung}
              onChange={(e) => setGedung(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="ALL">Gedung (All)</option>
              <option value="Gedung Putra">Gedung Putra</option>
              <option value="Gedung Putri">Gedung Putri</option>
            </select>

            {/* FILTER LANTAI */}
            <select
              value={lantai}
              onChange={(e) => setLantai(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="ALL">Lantai (All)</option>
              <option value="Lantai 1">Lantai 1</option>
              <option value="Lantai 2">Lantai 2</option>
              <option value="Lantai 3">Lantai 3</option>
              <option value="Lantai 4">Lantai 4</option>
            </select>

            {/* FILTER USROH */}
            <select
              value={usroh}
              onChange={(e) => setUsroh(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="ALL">Usroh (All)</option>
              <option value="Abu Bakar Ash-Shiddiq">
                Abu Bakar Ash-Shiddiq
              </option>
              <option value="Umar bin Khattab">
                Umar bin Khattab
              </option>
              <option value="Khadijah binti Khuwailid">
                Khadijah binti Khuwailid
              </option>
              <option value="Aisyah binti Abu Bakar">
                Aisyah binti Abu Bakar
              </option>
            </select>

            {/* IMPORT */}
            <button className="border bg-white px-4 py-2 rounded-lg hover:bg-gray-100">
              Impor Data
            </button>

            {/* ADD */}
            <a
              href="/admin/asrama/create"
              className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              + Add Data
            </a>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border py-3">No</th>
                  <th className="border py-3">Gedung</th>
                  <th className="border py-3">Lantai</th>
                  <th className="border py-3">Usroh</th>
                  <th className="border py-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="text-center">
                    <td className="border py-3">{index + 1}</td>
                    <td className="border py-3">{item.gedung}</td>
                    <td className="border py-3">{item.lantai}</td>
                    <td className="border py-3">{item.usroh}</td>
                    <td className="border py-3">
                      <div className="flex justify-center gap-4">
                        <a
                          href={`/admin/asrama/${item.id}`}
                          className="text-green-700 hover:scale-110 transition"
                        >
                          👁
                        </a>
                        <a
                          href={`/admin/asrama/edit/${item.id}`}
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
                      colSpan={5}
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
