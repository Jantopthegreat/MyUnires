export type TahfidzGradeInput = {
  residentId: string;
  usrohId: string;
  grade: "A" | "B" | "C" | "D" | "E";
};

export type TahfidzGrade = TahfidzGradeInput & {
  id: string;
  createdAt?: string;
};
