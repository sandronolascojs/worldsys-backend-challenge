import z from 'zod';

const minSqlDate = new Date('0001-01-01');
const maxSqlDate = new Date('9999-12-31');

export const userToInsertSchema = z.object({
  NombreCompleto: z.string().min(1).max(100),
  DNI: z.coerce.number().int().positive(),
  Estado: z.string().min(1).max(10),
  FechaIngreso: z.date().refine((date) => date >= minSqlDate && date <= maxSqlDate, {
    message: 'FechaIngreso out of SQL Server date range',
  }),
  EsPEP: z.boolean(),
  EsSujetoObligado: z.boolean().nullable(),
});

export type UserInsert = z.infer<typeof userToInsertSchema>;
