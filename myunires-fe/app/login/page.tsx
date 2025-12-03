"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { login, saveAuth, getRedirectPath } from "@/lib/api";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Email dan password harus diisi!",
        confirmButtonColor: "#0D6B44",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      // Simpan token dan user data ke localStorage
      saveAuth(response);

      // Success notification
      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang, ${response.user.name}!`,
        showConfirmButton: false,
        timer: 1500,
      });

      // Redirect berdasarkan role
      const redirectPath = getRedirectPath(response.user.role);
      router.push(redirectPath);
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: error.message || "Email atau password salah!",
        confirmButtonColor: "#0D6B44",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Bagian kiri (form login) */}
      <div className="w-3/4 bg-[#103B2E] flex justify-center items-center">
        <div className="bg-[#D9D9D9E5] bg-opacity-90 rounded-2xl px-10 py-10 w-[380px]">
          <h2 className="text-center text-[#004220] text-2xl font-medium mb-3">
            MyUnires
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* Input Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg px-4 py-2 border border-[#004220] text-[#00422080] placeholder-[#00422080]"
            />

            {/* Input Password + Icon */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg px-4 py-2 border border-[#004220] bg-transparent text-[#00422080] placeholder-[#00422080]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00422080] hover:text-[#004220]"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-auto mx-auto bg-[#0D6B44] text-white rounded-2xl py-3 px-8 font-semibold mt-2 hover:bg-[#0A5535] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Login"}
            </button>
          </form>

          <p className="text-center text-[#004220] text-sm mt-7 cursor-pointer hover:underline">
            Forgot Password ?
          </p>
        </div>
      </div>

      {/* Bagian kanan (welcome text + logo) */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center">
        <div className="flex items-center gap-10 mb-20 -mt-40">
          <img src="/lg_umy.svg" alt="UMY Logo" className="h-10" />
          <img src="/lg_unires.svg" alt="Unires Logo" className="h-10" />
        </div>

        <h1 className="text-3xl font-medium text-[#103B2E]">WELCOME</h1>
        <h2 className="text-4xl font-bold text-[#0D6B44] mt-1">MY UNIRES</h2>
      </div>
    </div>
  );
}
