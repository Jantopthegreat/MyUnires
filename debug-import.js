// DEBUG SCRIPT - Paste di Browser Console untuk debug Excel import
// Tekan F12 → Console → Paste script ini

console.log("🔍 DEBUG IMPORT EXCEL");
console.log("=".repeat(50));

// Test 1: Cek apakah backend running
console.log("\n📡 Test 1: Cek Backend...");
fetch("http://localhost:3001/api/musyrif/usroh", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
})
  .then((r) => {
    if (r.ok) {
      console.log("✅ Backend RUNNING");
      return r.json();
    } else {
      console.error("❌ Backend ERROR:", r.status);
    }
  })
  .then((d) => console.log("📊 Usroh data:", d))
  .catch((e) => console.error("❌ Backend tidak bisa diakses:", e));

// Test 2: Lihat data Usroh
console.log("\n📋 Test 2: Daftar Usroh");
fetch("http://localhost:3001/api/musyrif/usroh", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
})
  .then((r) => r.json())
  .then((d) => {
    console.table(d.data);
    console.log("💡 Gunakan ID ini untuk kolom usrohId di Excel");
  });

// Test 3: Lihat data Lantai
console.log("\n🏢 Test 3: Daftar Lantai");
fetch("http://localhost:3001/api/musyrif/lantai", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
})
  .then((r) => r.json())
  .then((d) => {
    console.table(d.data);
    console.log("💡 Gunakan ID ini untuk kolom lantaiId di Excel");
  });

// Test 4: Lihat residents yang sudah ada
console.log("\n👥 Test 4: Residents yang sudah ada");
fetch("http://localhost:3001/api/musyrif/residents/all", {
  headers: { Authorization: "Bearer " + localStorage.getItem("token") },
})
  .then((r) => r.json())
  .then((d) => {
    console.log(`Total residents: ${d.data.length}`);
    console.table(d.data.slice(0, 5)); // Show first 5
    console.log("⚠️ Email di atas sudah terdaftar, jangan dipakai lagi!");
  });

console.log("\n" + "=".repeat(50));
console.log("✅ Debug selesai! Lihat hasil di atas.");
console.log("💡 Tips: Copy salah satu email yang SUDAH ADA,");
console.log("   lalu coba import dengan email yang SAMA,");
console.log("   harusnya error: 'Email sudah terdaftar'");
