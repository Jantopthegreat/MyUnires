import Swal from "sweetalert2";

interface Resident {
  id: number;
  userId: number;
  name: string;
  email: string;
  nim: string;
  noUnires: string;
  jurusan: string;
  angkatan: number;
  usroh: string;
  usrohId: number | null;
  asrama: string;
  lantaiId: number | null;
  noTelp: string;
}

export const showResidentDetail = (resident: Resident) => {
  Swal.fire({
    title: "Detail Resident",
    html: `
      <div class="text-left">
        <p><strong>Nama:</strong> ${resident.name}</p>
        <p><strong>Email:</strong> ${resident.email}</p>
        <p><strong>NIM:</strong> ${resident.nim}</p>
        <p><strong>Jurusan:</strong> ${resident.jurusan}</p>
        <p><strong>Angkatan:</strong> ${resident.angkatan}</p>
        <p><strong>Usroh:</strong> ${resident.usroh}</p>
        <p><strong>Asrama:</strong> ${resident.asrama}</p>
        <p><strong>No. Telp:</strong> ${resident.noTelp}</p>
      </div>
    `,
    confirmButtonColor: "#0D6B44",
  });
};
