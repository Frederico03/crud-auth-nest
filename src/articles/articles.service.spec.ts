import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService', () => {
    let service: ArticlesService;
    let prisma: PrismaService;

    const mockPrismaService = {
        article: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticlesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ArticlesService>(ArticlesService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an article', async () => {
            const dto = { title: 'Test Title', content: 'Test Content' };
            const authorId = 1;
            const expectedResult = { id: 1, ...dto, authorId };

            mockPrismaService.article.create.mockResolvedValue(expectedResult);

            const result = await service.create(dto, authorId);
            expect(result).toEqual(expectedResult);
            expect(mockPrismaService.article.create).toHaveBeenCalledWith({
                data: { ...dto, authorId },
            });
        });
    });

    describe('findAll', () => {
        it('should return all articles', async () => {
            const articles = [{ id: 1, title: 'Article 1' }];
            mockPrismaService.article.findMany.mockResolvedValue(articles);

            const result = await service.findAll();
            expect(result).toEqual(articles);
        });
    });

    describe('findOne', () => {
        it('should return an article if found', async () => {
            const article = { id: 1, title: 'Article 1' };
            mockPrismaService.article.findUnique.mockResolvedValue(article);

            const result = await service.findOne(1);
            expect(result).toEqual(article);
        });

        it('should throw NotFoundException if article not found', async () => {
            mockPrismaService.article.findUnique.mockResolvedValue(null);
            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update an article', async () => {
            const dto = { title: 'Updated Title' };
            const expectedResult = { id: 1, title: 'Updated Title' };
            mockPrismaService.article.update.mockResolvedValue(expectedResult);

            const result = await service.update(1, dto);
            expect(result).toEqual(expectedResult);
        });

        it('should throw NotFoundException if update fails', async () => {
            mockPrismaService.article.update.mockRejectedValue(new Error());
            await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete an article', async () => {
            mockPrismaService.article.delete.mockResolvedValue({ id: 1 });
            const result = await service.remove(1);
            expect(result).toEqual({ message: 'Article deleted successfully' });
        });

        it('should throw NotFoundException if delete fails', async () => {
            mockPrismaService.article.delete.mockRejectedValue(new Error());
            await expect(service.remove(1)).rejects.toThrow(NotFoundException);
        });
    });
});
