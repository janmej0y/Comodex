import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { RoleEnum } from "../common/enums/role.enum";
import { PrismaService } from "../prisma/prisma.service";
import { LoginInput } from "./dto/login.input";
import { AuthPayload } from "./models/auth-payload.model";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!validPassword || user.role !== input.role) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as RoleEnum
      }
    };
  }
}
