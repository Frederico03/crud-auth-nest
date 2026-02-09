import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`Attempting login for email: ${email}`);
    // Busca usuário incluindo as permissões (roles)
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    this.logger.log(`User found: ${user ? user.email : 'null'}`);
    this.logger.log(!user)
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Mapeia as permissões para um array de strings (ADMIN, READER, etc)
    const roles = user.permissions.map((up) => up.permission.name);

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
