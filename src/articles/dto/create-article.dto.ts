import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
    @ApiProperty({ example: 'My First Article', description: 'The title of the article' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'This is the content of the article.', description: 'The content of the article' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
