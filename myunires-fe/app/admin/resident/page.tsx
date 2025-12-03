// src/app/admin/resident/page.tsx
"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useAuth } from '@/lib/useAuth';
import { useResidentData } from "@/lib/hooks/admin/useResidentData";
import { showResidentDetail, showAddEditResidentModal, confirmDeleteResident, Resident } from "@/lib/modal/admin/adminResidentModal";
import { handleExcelImport } from "@/lib/excelImport"; 
import { clearAuth } from "@/lib/api";
import ResidentFilterBar from "@/components/ResidentFilterBar"; 
import ResidentTable from "@/components/adminResidentTable"; 
import AdminSidebar from "@/components/adminsidebar"; // ✅ Menggunakan Sidebar Admin yang baru

// ... (Komponen AddResidentButton dan Logika CRUD/Import tetap sama)

const ALLOWED_ROLES = ["ADMIN"];

export default function AdminResidentPage() {
    const { user } = useAuth(ALLOWED_ROLES); 
    
    const [isOpen, setIsOpen] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const {
        residents,
        filteredResidents,
        usrohList,
        lantaiList,
        loading,
        searchTerm,
        setSearchTerm,
        selectedUsroh,
        setSelectedUsroh,
        selectedLantai,
        setSelectedLantai,
        refetchResidents,
    } = useResidentData();

    if (!user) return null; 
    
    const toggleSidebar = () => setIsOpen((prev) => !prev);

    // --- Handler CRUD dan Import (Tetap sama) ---
    // ... (handleImport, handleAdd, handleEdit, handleDelete) ...
    const handleImport = async (file: File) => {
        // Logika impor...
    };
    const handleAdd = async () => {
        const success = await showAddEditResidentModal(undefined, usrohList, lantaiList);
        if (success) refetchResidents(); 
    };
    const handleEdit = async (resident: Resident) => {
        const success = await showAddEditResidentModal(resident, usrohList, lantaiList);
        if (success) refetchResidents();
    };
    const handleDelete = async (resident: Resident) => {
        const confirmed = await confirmDeleteResident(resident);
        if (confirmed) refetchResidents();
    };
    // ...

    return (
        <div className="min-h-screen flex bg-white">
            {/* ===== HEADER LOGO / NAVBAR (Fixed Top) ===== */}
            {/* ... (Header Logo dan Logout Button) ... */}

            {/* ===== LOGOUT MODAL ===== */}
            {/* ... (Modal Logout) ... */}

            {/* ===== SIDEBAR ===== */}
            <AdminSidebar isOpen={isOpen} toggleSidebar={toggleSidebar} /> {/* ✅ DIPERBARUI */}

            {/* ===== MAIN CONTENT ===== */}
            <main
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
                    isOpen ? "ml-64" : "ml-12"
                }`}
            >
                {/* Spacer supaya tidak ketabrak header */}
                <div className="h-16" />

                {/* Header hijau */}
                <header className="px-6 py-4">
                    <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold shadow-md">
                        Daftar Nama Resident
                    </h1>
                </header>

                {/* ===== Filter Bar & Add Button ===== */}
                <div className="flex justify-between items-start px-6 mb-5">
                    <ResidentFilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedUsroh={selectedUsroh}
                        onUsrohChange={setSelectedUsroh}
                        selectedLantai={selectedLantai}
                        onLantaiChange={setSelectedLantai}
                        usrohList={usrohList}
                        lantaiList={lantaiList}
                        onImport={handleImport}
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-[#004220] text-white px-4 py-2 rounded-xl flex items-center shadow-md hover:bg-[#005a2e] transition h-[42px] font-semibold text-sm"
                    >
                        <FaPlus className="mr-2" /> Tambah Resident
                    </button>
                </div>

                {/* ===== Table ===== */}
                <section className="px-6 pb-6">
                    <ResidentTable
                        residents={filteredResidents}
                        loading={loading}
                        onViewDetail={showResidentDetail}
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                    />

                    {/* Info jumlah data */}
                    <div className="mt-3 text-sm text-gray-600">
                        Menampilkan {filteredResidents.length} dari {residents.length}{" "}
                        resident
                    </div>
                </section>
            </main>
        </div>
    );
}