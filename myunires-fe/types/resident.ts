export type Resident = {
  id: number;          // sesuaikan dengan backend (string/number)
  userId: number;
  name: string;
  email: string;
  nim: string;
  noUnires: string;
  jurusan: string;
  angkatan: number;
  usroh: string;
  usrohName?: string;
  usrohId: number | null;
  asrama: string;
  lantaiId: number | null;
  noTelp: string;
  uniresNumber?: string;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
