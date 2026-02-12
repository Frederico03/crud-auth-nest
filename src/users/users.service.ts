import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionName } from "../../generated/prisma/client";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...data } = updateUserDto;

    const updateData: any = { ...data };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      await this.prisma.$transaction([
        this.prisma.userPermission.deleteMany({ where: { userId: id } }),
        this.prisma.article.deleteMany({ where: { authorId: id } }),
        this.prisma.user.delete({ where: { id } }),
      ]);

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async updateRole(userId: number, updateRoleDto: UpdateRoleDto) {
    const { role } = updateRoleDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: { include: { permission: true } } },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const permission = await this.prisma.permission.findUnique({
      where: { name: role },
    });

    if (!permission) {
      throw new NotFoundException(`Permission ${role} not found`);
    }

    await this.prisma.userPermission.deleteMany({
      where: {
        userId,
        permission: {
          name: {
            in: [PermissionName.READER, PermissionName.EDITOR],
          },
        },
      },
    });

    return this.prisma.userPermission.create({
      data: {
        userId,
        permissionId: permission.id,
      },
      include: {
        permission: true,
      },
    });
  }
}
