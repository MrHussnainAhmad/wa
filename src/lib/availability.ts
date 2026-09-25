import { connectDB } from "@/lib/db";
import { Board, Booking } from "@/models";
import type { Types } from "mongoose";

export async function hasBookingConflict(
  boardId: string | Types.ObjectId,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
) {
  await connectDB();

  const filter: Record<string, unknown> = {
    boardId,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };

  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }

  const conflict = await Booking.findOne(filter).lean();
  return Boolean(conflict);
}

export async function syncBoardAvailability(boardId: string | Types.ObjectId) {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const active = await Booking.findOne({
    boardId,
    startDate: { $lte: today },
    endDate: { $gte: today },
  })
    .sort({ endDate: -1 })
    .lean();

  const upcoming = await Booking.find({
    boardId,
    endDate: { $gte: today },
  })
    .sort({ endDate: -1 })
    .limit(1)
    .lean();

  const bookedUntil = upcoming[0]?.endDate ?? active?.endDate ?? null;

  await Board.findByIdAndUpdate(boardId, {
    status: active ? "BOOKED" : "AVAILABLE",
    bookedUntil,
  });
}

export async function getBoardBookedRanges(boardId: string) {
  await connectDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Booking.find({
    boardId,
    endDate: { $gte: today },
  })
    .select("startDate endDate clientName")
    .sort({ startDate: 1 })
    .lean();
}
