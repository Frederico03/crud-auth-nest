import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PermissionName } from '../generated/prisma/client';
import { JwtService } from '@nestjs/jwt';

describe('ArticlesController (e2e)', () => {
    let app: INestApplication;
    let jwtService: JwtService;

    const mockPrismaService = {
        article: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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
        return jwtService.sign({ sub, email: 'test@example.com', roles });
    };

    describe('GET /articles', () => {
        it('should allow READER to list articles', () => {
            const token = generateToken([PermissionName.READER]);
            mockPrismaService.article.findMany.mockResolvedValue([]);

            return request(app.getHttpServer())
                .get('/articles')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });

        it('should deny unauthorized users', () => {
            return request(app.getHttpServer())
                .get('/articles')
                .expect(401);
        });
    });

    describe('POST /articles', () => {
        it('should allow EDITOR to create article', () => {
            const token = generateToken([PermissionName.EDITOR]);
            mockPrismaService.article.create.mockResolvedValue({ id: 1 });

            return request(app.getHttpServer())
                .post('/articles')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'New Article', content: 'Content' })
                .expect(201);
        });

        it('should deny READER to create article', () => {
            const token = generateToken([PermissionName.READER]);

            return request(app.getHttpServer())
                .post('/articles')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'New Article', content: 'Content' })
                .expect(403);
        });
    });

    describe('DELETE /articles/:id', () => {
        it('should allow ADMIN to delete article', () => {
            const token = generateToken([PermissionName.ADMIN]);
            mockPrismaService.article.delete.mockResolvedValue({ id: 1 });

            return request(app.getHttpServer())
                .delete('/articles/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });

        it('should deny READER to delete article', () => {
            const token = generateToken([PermissionName.READER]);

            return request(app.getHttpServer())
                .delete('/articles/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(403);
        });
    });
});
