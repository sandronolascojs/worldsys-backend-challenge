
export interface User {
  id: number;
  dni: string;
  firstName: string;
  lastName: string;
  state: string;
  entryDate: string;
  isPep: boolean;
  isSubjectObliged: boolean;
}

export type UserInsert = {
  NombreCompleto: string;
  DNI: number;
  Estado: string;
  FechaIngreso: Date;
  EsPEP: boolean;
  EsSujetoObligado: boolean | null;
}