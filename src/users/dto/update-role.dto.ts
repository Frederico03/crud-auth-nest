import { IsEnum } from 'class-validator';
import { PermissionName } from '../../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
    @ApiProperty({
        enum: PermissionName,
        description: 'The new role for the user',
        example: PermissionName.EDITOR,
    })
    @IsEnum(PermissionName)
    role: PermissionName;
}
