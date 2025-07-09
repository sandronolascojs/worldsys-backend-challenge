import type { ConnectionPool, Request, Transaction } from 'mssql';
import fs from 'node:fs';
import path from 'node:path';
import pino, { type Logger } from 'pino';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UsersRepository } from '../src/repositories/users.repository';
import { FileGeneratorService } from '../src/services/fileGenerator.service';
import { UserService } from '../src/services/user.service';
import {
  UserFileProcessorService,
  type UserToInsert,
} from '../src/services/userFileProcessor.service';

const MAX_FILE_SIZE = '1mb';
const ERROR_RATE = 0.1;
let insertedUsers: UserToInsert[] = [];

/**
 * Mock de UserService: sustituimos sólo bulkInsertUsers y
 * exponemos insertedUsers para las aserciones.
 */
vi.mock('../src/services/user.service', async () => {
  return {
    ...(await vi.importActual<typeof import('../src/services/user.service')>(
      '../src/services/user.service',
    )),
    UserService: vi.fn().mockImplementation(() => ({
      bulkInsertUsers: vi.fn(async (users: UserToInsert[]) => {
        insertedUsers.push(...users);
      }),
    })),
  };
});

vi.mock('../src/repositories/users.repository', () => ({
  UsersRepository: vi.fn().mockImplementation(() => ({
    insertUsers: vi.fn(async (users: UserToInsert[]) => {
      insertedUsers.push(...users);
    }),
  })),
}));

// Mock Request
const mockRequest: Partial<Request> = {
  bulk: vi.fn().mockResolvedValue(undefined),
};

// Mock Transaction
const mockTransaction: Partial<Transaction> = {
  begin: vi.fn().mockResolvedValue(undefined),
  commit: vi.fn().mockResolvedValue(undefined),
  rollback: vi.fn().mockResolvedValue(undefined),
};

const mockPool = Object.create({
  connected: true,
  request: () => mockRequest,
  transaction: () => mockTransaction,
}) as ConnectionPool;

const TEST_FILE_PATH = path.resolve(__dirname, './CLIENTES_IN_0425_test.dat');
const TEST_CHECKPOINT_FILE = path.resolve(__dirname, './test_processing.checkpoint');

function cleanupTestFiles() {
  [TEST_FILE_PATH, TEST_CHECKPOINT_FILE].forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));
}

describe('UserFileProcessorService', () => {
  let processor: UserFileProcessorService;
  let fileGenerator: FileGeneratorService;
  let logger: Logger;
  let userServiceMock: InstanceType<typeof UserService>;
  let usersRepositoryMock: InstanceType<typeof UsersRepository>;

  beforeEach(async () => {
    cleanupTestFiles();
    insertedUsers = [];
    logger = pino({ level: 'silent' });
    vi.spyOn(logger, 'warn');
    vi.spyOn(logger, 'info');
    vi.spyOn(logger, 'error');

    usersRepositoryMock = new UsersRepository(mockPool);
    userServiceMock = new UserService(usersRepositoryMock);
    fileGenerator = new FileGeneratorService(TEST_FILE_PATH);
    processor = new UserFileProcessorService(
      userServiceMock,
      logger,
      TEST_FILE_PATH,
      TEST_CHECKPOINT_FILE,
    );
    const size = fileGenerator.parseSize(MAX_FILE_SIZE);
    const records = fileGenerator.estimateRecords(size);
    await fileGenerator.runFileGenerator(records, ERROR_RATE);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanupTestFiles();
  });

  it('should process the file, insert valid users and register invalid users', async () => {
    expect(fs.existsSync(TEST_FILE_PATH)).toBe(true);

    await processor.processFile();

    expect(insertedUsers.length).toBeGreaterThan(0);
    expect(insertedUsers.length).toBeGreaterThanOrEqual(1);
    expect(logger.warn).toHaveBeenCalled();
  });
});
