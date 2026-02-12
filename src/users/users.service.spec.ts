import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PermissionName } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let prisma: PrismaService;

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        permission: {
            findUnique: jest.fn(),
        },
        userPermission: {
            deleteMany: jest.fn(),
            create: jest.fn(),
        },
        article: {
            deleteMany: jest.fn(),
        },
        $transaction: jest.fn((promises) => Promise.all(promises)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updateRole', () => {
        it('should update user role', async () => {
            const userId = 1;
            const role = PermissionName.EDITOR;
            const user = { id: userId, permissions: [] };
            const permission = { id: 2, name: role };

            mockPrismaService.user.findUnique.mockResolvedValue(user);
            mockPrismaService.permission.findUnique.mockResolvedValue(permission);
            mockPrismaService.userPermission.deleteMany.mockResolvedValue({ count: 1 });
            mockPrismaService.userPermission.create.mockResolvedValue({ userId, permissionId: 2, permission });

            const result = await service.updateRole(userId, { role });

            expect(result.permission.name).toBe(role);
            expect(mockPrismaService.userPermission.deleteMany).toHaveBeenCalled();
            expect(mockPrismaService.userPermission.create).toHaveBeenCalledWith({
                data: { userId, permissionId: permission.id },
                include: { permission: true },
            });
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.updateRole(1, { role: PermissionName.EDITOR })).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if permission not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
            mockPrismaService.permission.findUnique.mockResolvedValue(null);
            await expect(service.updateRole(1, { role: PermissionName.EDITOR })).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete user and related data in transaction', async () => {
            const userId = 1;
            mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });

            const result = await service.remove(userId);

            expect(result).toEqual({ message: 'User deleted successfully' });
            expect(mockPrismaService.$transaction).toHaveBeenCalled();
            expect(mockPrismaService.userPermission.deleteMany).toHaveBeenCalledWith({ where: { userId } });
            expect(mockPrismaService.article.deleteMany).toHaveBeenCalledWith({ where: { authorId: userId } });
            expect(mockPrismaService.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
        });

        it('should throw NotFoundException if user to delete not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});
