"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaRegEnvelope } from "react-icons/fa";
import Swal from "sweetalert2";

import { login, saveAuth, getRedirectPath } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const el = document.getElementById("email") as HTMLInputElement | null;
      el?.focus();
    }, 250);
    return () => clearTimeout(t);
  }, []);

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
      saveAuth(response);

      await Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang, ${response.user.name}!`,
        showConfirmButton: false,
        timer: 1200,
      });

      router.push(getRedirectPath(response.user.role));
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: error?.message || "Email atau password salah!",
        confirmButtonColor: "#0D6B44",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/lg.jpg"
          alt="UNIRES Background"
          fill
          priority
          className="object-cover object-center"
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-[#004220]/80" />
      </div>

      {/* Decorative */}
      <div className="absolute inset-0 z-10">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-emerald-500/15 rounded-full blur-3xl" />
      </div>

      {/* Layout */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* HERO (tetap terlihat di mobile) */}
        <section className="flex-1 flex items-center justify-center px-6 pt-10 pb-6 md:py-10">
          <div className="w-full max-w-3xl text-center">
            <div className="flex items-center justify-center gap-5 mb-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-2xl ring-1 ring-white/30">
                <Image
                  src="/lg_umy.svg"
                  alt="UMY Logo"
                  width={92}
                  height={92}
                  priority
                  className="object-contain"
                />
              </div>
              <div className="h-16 w-px bg-white/25" />
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-2xl ring-1 ring-white/30">
                <Image
                  src="/lg_unires.svg"
                  alt="UNIRES Logo"
                  width={92}
                  height={92}
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
              UNIRES
            </h1>
            <div className="h-1 w-28 bg-gradient-to-r from-transparent via-white/90 to-transparent mx-auto mt-4" />
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold text-white/95">
              University Residence
            </h2>
            <p className="mt-3 text-base sm:text-lg text-white/80 font-light">
              Universitas Muhammadiyah Yogyakarta
            </p>
            <p className="mt-4 text-sm sm:text-base text-white/70 font-light italic">
              UNIRES UMY !!! Membangun Pribadi, Mengukir Prestasi
            </p>
          </div>
        </section>

        {/* LOGIN CARD
            Mobile: bottom sheet (tidak nutup hero)
            Desktop: floating card */}
        <section className="w-full md:flex md:items-center md:justify-center md:px-6 md:pb-10">
          <div
            className={[
              "w-full md:w-[420px]",
              // glass card (backdrop blur) [web:1452]
              "bg-white/12 backdrop-blur-xl",
              "border border-white/20",
              "shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
              // radius: mobile sheet, desktop card
              "rounded-t-[28px] md:rounded-3xl",
              // spacing
              "px-6 py-6 md:px-8 md:py-8",
              // safe area for iOS
              "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
            ].join(" ")}
          >
            {/* Top strip */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Selamat Datang
                </h3>
                <p className="mt-1 text-xs text-white/70">
                  Masuk menggunakan akun yang terdaftar
                </p>
              </div>
            </div>

            <div className="mt-5 h-px bg-white/15" />

            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                    <FaRegEnvelope size={14} />
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="contoh : fauzan.althaf.ft22@mail.umy.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={[
                      "w-full rounded-xl",
                      "pl-10 pr-4 py-3",
                      "text-sm text-white placeholder:text-white/40",
                      "bg-white/10 border border-white/15",
                      "outline-none",
                      "focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/25",
                      "transition",
                      "disabled:opacity-60",
                    ].join(" ")}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Password
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                    <FaLock size={14} />
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={[
                      "w-full rounded-xl",
                      "pl-10 pr-11 py-3",
                      "text-sm text-white placeholder:text-white/40",
                      "bg-white/10 border border-white/15",
                      "outline-none",
                      "focus:border-emerald-300/60 focus:ring-2 focus:ring-emerald-400/25",
                      "transition",
                      "disabled:opacity-60",
                    ].join(" ")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={[
                  "w-full rounded-xl py-3 font-semibold text-sm",
                  "text-white",
                  "bg-gradient-to-r from-emerald-600 to-emerald-700",
                  "hover:from-emerald-500 hover:to-emerald-700",
                  "shadow-[0_14px_30px_rgba(16,185,129,0.25)]",
                  "transition",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {isLoading ? "Loading..." : "Login"}
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  Swal.fire({
                    icon: "info",
                    title: "Forgot Password",
                    text: "Silakan hubungi admin untuk reset password.",
                    confirmButtonColor: "#0D6B44",
                  });
                }}
                className="w-full text-center text-xs text-white/70 hover:text-white hover:underline transition"
              >
                Forgot Password?
              </button>
            </form>

            <div className="mt-6 text-center text-[11px] text-white/55">
              © 2025 UNIRES UMY
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
