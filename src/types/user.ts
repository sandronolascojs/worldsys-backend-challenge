import z from 'zod';

export const userToInsertSchema = z.object({
  NombreCompleto: z.string().min(1).max(100),
  DNI: z.number().int().positive(),
  Estado: z.string().min(1).max(10),
  FechaIngreso: z.date(),
  EsPEP: z.boolean(),
  EsSujetoObligado: z.boolean().nullable(),
});

export type UserInsert = z.infer<typeof userToInsertSchema>;
