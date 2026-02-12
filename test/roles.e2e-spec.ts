import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PermissionName } from '../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('Roles Management (e2e)', () => {
    let app: INestApplication;
    let jwtService: JwtService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
        },
        permission: {
            findUnique: jest.fn(),
        },
        userPermission: {
            deleteMany: jest.fn(),
            create: jest.fn(),
        },
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrismaService)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        jwtService = moduleFixture.get<JwtService>(JwtService);
    });

    afterAll(async () => {
        await app.close();
    });

    const generateToken = (roles: string[], sub = 1) => {
        return jwtService.sign({ sub, email: 'admin@example.com', roles });
    };

    describe('PATCH /users/:id/role', () => {
        it('should allow ADMIN to update roles', () => {
            const token = generateToken([PermissionName.ADMIN]);
            mockPrismaService.user.findUnique.mockResolvedValue({ id: 2 });
            mockPrismaService.permission.findUnique.mockResolvedValue({ id: 3, name: PermissionName.EDITOR });
            mockPrismaService.userPermission.deleteMany.mockResolvedValue({ count: 1 });
            mockPrismaService.userPermission.create.mockResolvedValue({ userId: 2, permissionId: 3 });

            return request(app.getHttpServer())
                .patch('/users/2/role')
                .set('Authorization', `Bearer ${token}`)
                .send({ role: PermissionName.EDITOR })
                .expect(200);
        });

        it('should deny EDITOR to update roles', () => {
            const token = generateToken([PermissionName.EDITOR]);

            return request(app.getHttpServer())
                .patch('/users/2/role')
                .set('Authorization', `Bearer ${token}`)
                .send({ role: PermissionName.READER })
                .expect(403);
        });
    });
});
