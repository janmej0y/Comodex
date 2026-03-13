import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { Request } from "express";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ProductsModule } from "./products/products.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { ProcurementModule } from "./procurement/procurement.module";
import { AlertsModule } from "./alerts/alerts.module";
import { AuditModule } from "./audit/audit.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        sortSchema: true,
        playground: configService.get<string>("NODE_ENV") !== "production",
        introspection: true,
        context: ({ req }: { req: Request }) => ({ req })
      })
    }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    ProcurementModule,
    AlertsModule,
    AuditModule,
    DashboardModule
  ]
})
export class AppModule {}

