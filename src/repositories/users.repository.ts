import mssql, { Table } from 'mssql';
import type { UserInsert } from 'types/user';

export class UsersRepository {
  constructor(private readonly pool: mssql.ConnectionPool) {}

  async insertUsers(users: UserInsert[]) {
    const table = new Table('users');
    table.columns.add('NombreCompleto', mssql.NVarChar(100), { nullable: false });
    table.columns.add('DNI', mssql.BigInt, { nullable: false });
    table.columns.add('Estado', mssql.VarChar(10), { nullable: false });
    table.columns.add('FechaIngreso', mssql.Date, { nullable: false });
    table.columns.add('EsPEP', mssql.Bit, { nullable: false });
    table.columns.add('EsSujetoObligado', mssql.Bit, { nullable: true });

    users.forEach((user) => {
      table.rows.add(
        user.NombreCompleto,
        user.DNI,
        user.Estado,
        user.FechaIngreso,
        user.EsPEP,
        user.EsSujetoObligado,
      );
    });

    const transaction = new mssql.Transaction(this.pool);
    await transaction.begin();
    try {
      const request = new mssql.Request(transaction);
      await request.bulk(table);
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
