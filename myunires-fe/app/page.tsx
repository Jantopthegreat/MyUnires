"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke login setelah 10 detik
    const timer = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image + overlay */}
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#004220]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#004220]/20 rounded-full blur-3xl" />
      </div>

      {/* Main */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="flex items-center gap-8 mb-12 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <Image
              src="/lg_umy.svg"
              alt="UMY Logo"
              width={120}
              height={120}
              priority
              className="object-contain"
            />
          </div>

          <div className="h-24 w-px bg-white/30" />

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <Image
              src="/lg_unires.svg"
              alt="UNIRES Logo"
              width={120}
              height={120}
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Text */}
        <div
          className="text-center space-y-6 max-w-3xl animate-fadeIn"
          style={{ animationDelay: "0.2s" }}
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">
            UNIRES
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto" />
          <h2 className="text-3xl md:text-4xl font-semibold text-white/95">
            University Residence
          </h2>
          <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed">
            Universitas Muhammadiyah Yogyakarta
          </p>
          <p className="text-lg text-white/70 font-light italic max-w-2xl mx-auto mt-4">
            UNIRES UMY !!! Membangun Pribadi, Mengukir Prestasi
          </p>
        </div>

        {/* Loading */}
        <div
          className="mt-16 w-64 animate-fadeIn"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-white rounded-full animate-loadingBar" />
          </div>
          <p className="text-white/60 text-sm text-center mt-4 font-light">
            Memuat sistem...
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 py-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="text-center space-y-2">
          <p className="text-white/70 text-sm font-light">
            Sistem Informasi University Residence
          </p>
          <p className="text-white/50 text-xs">
            © 2025 UNIRES UMY - All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
