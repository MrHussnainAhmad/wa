"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import {
  Board,
  Booking,
  Lead,
  Testimonial,
  Faq,
  AdminUser,
  Setting,
} from "@/models";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {
  hasBookingConflict,
  syncBoardAvailability,
} from "@/lib/availability";
import { DEFAULT_SETTINGS } from "@/lib/settings";

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/boards");
  revalidatePath("/");
}

export async function createBoard(formData: FormData) {
  const session = await requireAdmin();
  await connectDB();

  const photosRaw = String(formData.get("photosJson") || "[]");
  let photos: Array<{ url: string; publicId: string; sortOrder: number }> = [];
  try {
    photos = JSON.parse(photosRaw);
  } catch {
    photos = [];
  }

  const board = await Board.create({
    city: String(formData.get("city")),
    address: String(formData.get("address")),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    size: String(formData.get("size")),
    type: String(formData.get("type")),
    dailyTraffic: Number(formData.get("dailyTraffic")),
    pricePerMonth: Number(formData.get("pricePerMonth")),
    status: "AVAILABLE",
    photos,
  });

  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "CREATE",
    entityType: "Board",
    entityId: String(board._id),
  });

  revalidateAdmin();
  return String(board._id);
}

export async function updateBoard(id: string, formData: FormData) {
  const session = await requireAdmin();
  await connectDB();

  const photosRaw = String(formData.get("photosJson") || "[]");
  let photos: Array<{ url: string; publicId: string; sortOrder: number }> = [];
  try {
    photos = JSON.parse(photosRaw);
  } catch {
    photos = [];
  }

  await Board.findByIdAndUpdate(id, {
    city: String(formData.get("city")),
    address: String(formData.get("address")),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    size: String(formData.get("size")),
    type: String(formData.get("type")),
    dailyTraffic: Number(formData.get("dailyTraffic")),
    pricePerMonth: Number(formData.get("pricePerMonth")),
    photos,
  });

  await syncBoardAvailability(id);

  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "UPDATE",
    entityType: "Board",
    entityId: id,
  });

  revalidateAdmin();
}

export async function deleteBoard(id: string) {
  const session = await requireAdmin();
  await connectDB();
  await Booking.deleteMany({ boardId: id });
  await Board.findByIdAndDelete(id);
  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "DELETE",
    entityType: "Board",
    entityId: id,
  });
  revalidateAdmin();
}

export async function createBooking(formData: FormData) {
  const session = await requireAdmin();
  await connectDB();

  const boardId = String(formData.get("boardId"));
  const startDate = new Date(String(formData.get("startDate")));
  const endDate = new Date(String(formData.get("endDate")));

  if (endDate < startDate) throw new Error("End date before start date");

  const conflict = await hasBookingConflict(boardId, startDate, endDate);
  if (conflict) throw new Error("Date conflict with an existing booking");

  const booking = await Booking.create({
    boardId,
    clientName: String(formData.get("clientName")),
    startDate,
    endDate,
    agreedPrice: Number(formData.get("agreedPrice")),
    depositStatus: String(formData.get("depositStatus") || "PENDING"),
    contractFileUrl: String(formData.get("contractFileUrl") || "") || null,
    createdById: session.user.id,
  });

  await syncBoardAvailability(boardId);

  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "CREATE",
    entityType: "Booking",
    entityId: String(booking._id),
  });

  revalidatePath("/admin/bookings");
  revalidateAdmin();
}

export async function updateLead(id: string, formData: FormData) {
  const session = await requireAdmin();
  await connectDB();
  await Lead.findByIdAndUpdate(id, {
    status: String(formData.get("status")),
    notes: String(formData.get("notes") || ""),
  });
  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "UPDATE",
    entityType: "Lead",
    entityId: id,
  });
  revalidatePath("/admin/leads");
}

export async function upsertTestimonial(id: string | null, formData: FormData) {
  const session = await requireAdmin();
  await connectDB();
  const payload = {
    clientName: String(formData.get("clientName")),
    company: String(formData.get("company")),
    quote: String(formData.get("quote")),
    active: formData.get("active") === "on",
    displayOrder: Number(formData.get("displayOrder") || 0),
  };
  if (id) {
    await Testimonial.findByIdAndUpdate(id, payload);
  } else {
    await Testimonial.create(payload);
  }
  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: id ? "UPDATE" : "CREATE",
    entityType: "Testimonial",
    entityId: id || "",
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonial(id: string) {
  const session = await requireAdmin();
  await connectDB();
  await Testimonial.findByIdAndDelete(id);
  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "DELETE",
    entityType: "Testimonial",
    entityId: id,
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function upsertFaq(id: string | null, formData: FormData) {
  const session = await requireAdmin();
  await connectDB();
  const payload = {
    question: String(formData.get("question")),
    answer: String(formData.get("answer")),
    active: formData.get("active") === "on",
    displayOrder: Number(formData.get("displayOrder") || 0),
  };
  if (id) await Faq.findByIdAndUpdate(id, payload);
  else await Faq.create(payload);
  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: id ? "UPDATE" : "CREATE",
    entityType: "Faq",
    entityId: id || "",
  });
  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

export async function deleteFaq(id: string) {
  const session = await requireAdmin();
  await connectDB();
  await Faq.findByIdAndDelete(id);
  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "DELETE",
    entityType: "Faq",
    entityId: id,
  });
  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

export async function updateSettings(formData: FormData) {
  const session = await requireSuperAdmin();
  await connectDB();

  const durationMultipliers = {
    "1": Number(formData.get("duration_1") || 1),
    "3": Number(formData.get("duration_3") || 0.95),
    "6": Number(formData.get("duration_6") || 0.9),
    "12": Number(formData.get("duration_12") || 0.85),
  };

  const typeMultipliers = {
    static: Number(formData.get("type_static") || 1),
    digital: Number(formData.get("type_digital") || 1.15),
  };

  const existing = await Setting.findOne({ key: "app" });
  const tokenInput = String(formData.get("waAccessToken") || "").trim();
  const waAccessToken = tokenInput || existing?.waAccessToken || "";

  const waAutoDelayMinutes = Math.max(
    5,
    Math.min(24 * 60, Number(formData.get("waAutoDelayMinutes") || 30))
  );
  const waAutoMaxPerRun = Math.max(
    1,
    Math.min(5, Number(formData.get("waAutoMaxPerRun") || 3))
  );
  const waAutoMaxPerDay = Math.max(
    1,
    Math.min(100, Number(formData.get("waAutoMaxPerDay") || 40))
  );
  const waAutoMinSecondsBetween = Math.max(
    15,
    Math.min(300, Number(formData.get("waAutoMinSecondsBetween") || 20))
  );

  await Setting.findOneAndUpdate(
    { key: "app" },
    {
      key: "app",
      designFee: Number(formData.get("designFee")),
      currency: String(formData.get("currency")),
      whatsappNumber: String(formData.get("whatsappNumber")),
      durationMultipliers,
      typeMultipliers,
      waApiEnabled: formData.get("waApiEnabled") === "on",
      waAccessToken,
      waPhoneNumberId: String(formData.get("waPhoneNumberId") || "").trim(),
      waApiVersion: String(formData.get("waApiVersion") || "v21.0").trim(),
      waAutoEnabled: formData.get("waAutoEnabled") === "on",
      waAutoDelayMinutes,
      waAutoMaxPerRun,
      waAutoMaxPerDay,
      waAutoMinSecondsBetween,
      waTemplateName: String(formData.get("waTemplateName") || "").trim(),
      waTemplateLanguage: String(formData.get("waTemplateLanguage") || "en").trim(),
      waMessageNote: String(formData.get("waMessageNote") || "").trim(),
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "UPDATE",
    entityType: "Setting",
    entityId: "app",
    meta: {
      waApiEnabled: formData.get("waApiEnabled") === "on",
      waAutoEnabled: formData.get("waAutoEnabled") === "on",
      tokenUpdated: Boolean(tokenInput),
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/quote");
}

export async function createSalesRep(formData: FormData) {
  const session = await requireSuperAdmin();
  await connectDB();
  const email = String(formData.get("email")).toLowerCase().trim();
  const password = String(formData.get("password"));
  const name = String(formData.get("name") || "");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await AdminUser.create({
    email,
    passwordHash,
    name,
    role: "SALES_REP",
  });
  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "CREATE",
    entityType: "AdminUser",
    entityId: String(user._id),
  });
  revalidatePath("/admin/users");
}

export async function deleteSalesRep(id: string) {
  const session = await requireSuperAdmin();
  await connectDB();
  const user = await AdminUser.findById(id);
  if (!user || user.role === "SUPER_ADMIN") {
    throw new Error("Cannot delete this user");
  }
  await AdminUser.findByIdAndDelete(id);
  await writeAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: "DELETE",
    entityType: "AdminUser",
    entityId: id,
  });
  revalidatePath("/admin/users");
}

export async function ensureSettings() {
  await connectDB();
  const existing = await Setting.findOne({ key: "app" });
  if (!existing) await Setting.create({ key: "app", ...DEFAULT_SETTINGS });
}
