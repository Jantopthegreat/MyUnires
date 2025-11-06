export type Resident = {
  id: string;          // sesuaikan dengan backend (string/number)
  name: string;
  usrohName: string;
  uniresNumber: string;
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
