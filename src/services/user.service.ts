import { UsersRepository } from 'repositories/users.repository';
import type { UserInsert } from 'types/user';

export class UserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async bulkInsertUsers(users: UserInsert[]) {
    return this.usersRepository.insertUsers(users);
  }
}
