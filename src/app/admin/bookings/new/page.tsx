import { connectDB } from "@/lib/db";
import { Board } from "@/models";
import { BookingForm } from "@/components/admin/BookingForm";

export default async function NewBookingPage() {
  await connectDB();
  const boards = await Board.find().sort({ city: 1 }).lean();

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
        New booking
      </h1>
      <BookingForm
        boards={boards.map((b) => ({
          id: String(b._id),
          label: `${b.city} — ${b.address}`,
        }))}
      />
    </div>
  );
}
