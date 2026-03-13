import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { RoleEnum } from "../common/enums/role.enum";
import { PrismaService } from "../prisma/prisma.service";
import { LoginInput } from "./dto/login.input";
import { RefreshSessionInput } from "./dto/refresh-session.input";
import { SignupInput } from "./dto/signup.input";
import { AuthPayload } from "./models/auth-payload.model";
import { UserModel } from "./models/user.model";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private buildAccessToken(user: { id: string; email: string; role: string }) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });
  }

  private async issueRefreshToken(userId: string) {
    const refreshToken = crypto.randomBytes(48).toString("hex");
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const ttlDays = Number(this.configService.get<string>("JWT_REFRESH_EXPIRES_DAYS") ?? 14);
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt
      }
    });

    return refreshToken;
  }

  private async buildAuthPayload(user: { id: string; name: string; email: string; role: string }): Promise<AuthPayload> {
    const [token, refreshToken] = await Promise.all([this.buildAccessToken(user), this.issueRefreshToken(user.id)]);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as RoleEnum
      }
    };
  }

  async signup(input: SignupInput): Promise<UserModel> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new BadRequestException("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: input.role
      }
    });

    await this.prisma.auditEvent.create({
      data: {
        action: "ACCOUNT_CREATED",
        entityType: "USER",
        entityId: user.id,
        metadata: { role: user.role },
        actorId: user.id
      }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as RoleEnum
    };
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() }
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!validPassword || user.role !== input.role) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    await this.prisma.auditEvent.create({
      data: {
        action: "LOGIN_SUCCESS",
        entityType: "AUTH",
        entityId: user.id,
        metadata: { role: user.role },
        actorId: user.id
      }
    });

    return this.buildAuthPayload(user);
  }

  async refreshSession(input: RefreshSessionInput): Promise<AuthPayload> {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 25
    });

    const match = await (async () => {
      for (const entry of tokens) {
        const valid = await bcrypt.compare(input.refreshToken, entry.tokenHash);
        if (valid) {
          return entry;
        }
      }
      return null;
    })();

    if (!match) {
      throw new UnauthorizedException("Refresh token is invalid or expired.");
    }

    await this.prisma.refreshToken.update({
      where: { id: match.id },
      data: { revokedAt: new Date() }
    });

    return this.buildAuthPayload(match.user);
  }

  async logout(refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { revokedAt: null },
      orderBy: { createdAt: "desc" },
      take: 25
    });

    for (const entry of tokens) {
      const valid = await bcrypt.compare(refreshToken, entry.tokenHash);
      if (valid) {
        await this.prisma.refreshToken.update({
          where: { id: entry.id },
          data: { revokedAt: new Date() }
        });
        return true;
      }
    }

    return true;
  }
}