import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AuditEventModel {
  @Field()
  id!: string;

  @Field()
  action!: string;

  @Field()
  entityType!: string;

  @Field()
  entityId!: string;

  @Field({ nullable: true })
  actorId?: string;

  @Field({ nullable: true })
  metadata?: string;

  @Field()
  createdAt!: Date;
}

