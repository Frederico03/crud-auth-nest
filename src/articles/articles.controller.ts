import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
    Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PermissionName } from "../../generated/prisma/client";

@ApiTags('Articles')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) { }

    @Post()
    @Roles(PermissionName.ADMIN, PermissionName.EDITOR)
    @ApiOperation({ summary: 'Create a new article (Admin/Editor)' })
    create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
        // req.user logic depends on what is set by AuthGuard. Based on previous turns, user has sub: id
        return this.articlesService.create(createArticleDto, req.user.sub);
    }

    @Get()
    @Roles(PermissionName.ADMIN, PermissionName.EDITOR, PermissionName.READER)
    @ApiOperation({ summary: 'Get all articles (Admin/Editor/Reader)' })
    findAll() {
        return this.articlesService.findAll();
    }

    @Get(':id')
    @Roles(PermissionName.ADMIN, PermissionName.EDITOR, PermissionName.READER)
    @ApiOperation({ summary: 'Get an article by ID (Admin/Editor/Reader)' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.findOne(id);
    }

    @Patch(':id')
    @Roles(PermissionName.ADMIN, PermissionName.EDITOR)
    @ApiOperation({ summary: 'Update an article (Admin/Editor)' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateArticleDto: UpdateArticleDto,
    ) {
        return this.articlesService.update(id, updateArticleDto);
    }

    @Delete(':id')
    @Roles(PermissionName.ADMIN, PermissionName.EDITOR)
    @ApiOperation({ summary: 'Delete an article (Admin/Editor)' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.articlesService.remove(id);
    }
}
