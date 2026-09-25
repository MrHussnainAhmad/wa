import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models";

export async function writeAudit(input: {
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  await connectDB();
  await AuditLog.create({
    actorId: input.actorId,
    actorEmail: input.actorEmail,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? "",
    meta: input.meta ?? {},
  });
}
