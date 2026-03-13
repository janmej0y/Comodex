import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async auditTrail(limit = 30) {
    const events = await this.prisma.auditEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return events.map((event) => ({
      ...event,
      metadata: event.metadata ? JSON.stringify(event.metadata) : undefined
    }));
  }
}

