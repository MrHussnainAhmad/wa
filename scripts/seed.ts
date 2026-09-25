import dns from "dns";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Board } from "../src/models/Board";
import { Booking } from "../src/models/Booking";
import { Lead } from "../src/models/Lead";
import { Testimonial } from "../src/models/Testimonial";
import { Faq } from "../src/models/Faq";
import { AdminUser } from "../src/models/AdminUser";
import { Setting } from "../src/models/Setting";
import { DEFAULT_SETTINGS } from "../src/lib/settings";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  /* ignore */
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");

  await mongoose.connect(uri);
  console.log("Connected");

  await Promise.all([
    Board.deleteMany({}),
    Booking.deleteMany({}),
    Lead.deleteMany({}),
    Testimonial.deleteMany({}),
    Faq.deleteMany({}),
    AdminUser.deleteMany({}),
    Setting.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("admin123", 10);
  const salesHash = await bcrypt.hash("sales123", 10);

  const [admin, sales] = await AdminUser.create([
    {
      email: "admin@waqasadvertisers.com",
      passwordHash,
      role: "SUPER_ADMIN",
      name: "Waqas Admin",
    },
    {
      email: "sales@waqasadvertisers.com",
      passwordHash: salesHash,
      role: "SALES_REP",
      name: "Sales Rep",
    },
  ]);

  await Setting.create({ key: "app", ...DEFAULT_SETTINGS });

  const boards = await Board.create([
    {
      city: "Karachi",
      address: "Shahrah-e-Faisal near Airport",
      latitude: 24.9008,
      longitude: 67.1681,
      size: "40x20 ft",
      type: "STATIC",
      dailyTraffic: 85000,
      pricePerMonth: 180000,
      status: "AVAILABLE",
      photos: [
        {
          url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80",
          publicId: "seed-khi-1",
          sortOrder: 0,
        },
      ],
    },
    {
      city: "Karachi",
      address: "Clifton Beach Road",
      latitude: 24.8126,
      longitude: 67.0225,
      size: "30x15 ft Digital LED",
      type: "DIGITAL",
      dailyTraffic: 120000,
      pricePerMonth: 320000,
      status: "AVAILABLE",
      photos: [
        {
          url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&q=80",
          publicId: "seed-khi-2",
          sortOrder: 0,
        },
      ],
    },
    {
      city: "Lahore",
      address: "MM Alam Road",
      latitude: 31.5204,
      longitude: 74.3587,
      size: "36x18 ft",
      type: "STATIC",
      dailyTraffic: 95000,
      pricePerMonth: 210000,
      status: "AVAILABLE",
      photos: [
        {
          url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
          publicId: "seed-lhr-1",
          sortOrder: 0,
        },
      ],
    },
    {
      city: "Lahore",
      address: "Canal Bank Road",
      latitude: 31.4902,
      longitude: 74.3294,
      size: "20x10 ft Digital",
      type: "DIGITAL",
      dailyTraffic: 70000,
      pricePerMonth: 250000,
      status: "AVAILABLE",
      photos: [
        {
          url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80",
          publicId: "seed-lhr-2",
          sortOrder: 0,
        },
      ],
    },
    {
      city: "Islamabad",
      address: "Blue Area Jinnah Avenue",
      latitude: 33.7156,
      longitude: 73.0621,
      size: "40x20 ft",
      type: "STATIC",
      dailyTraffic: 60000,
      pricePerMonth: 195000,
      status: "AVAILABLE",
      photos: [
        {
          url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
          publicId: "seed-isb-1",
          sortOrder: 0,
        },
      ],
    },
    {
      city: "Rawalpindi",
      address: "Murree Road",
      latitude: 33.6261,
      longitude: 73.0714,
      size: "30x15 ft",
      type: "STATIC",
      dailyTraffic: 78000,
      pricePerMonth: 160000,
      status: "AVAILABLE",
      photos: [
        {
          url: "https://images.unsplash.com/photo-1496568816309-51b7c9d7dd5e?w=1200&q=80",
          publicId: "seed-rwp-1",
          sortOrder: 0,
        },
      ],
    },
  ]);

  const now = new Date();
  const in10 = new Date(now);
  in10.setDate(in10.getDate() + 10);
  const past30 = new Date(now);
  past30.setDate(past30.getDate() - 30);
  const future60 = new Date(now);
  future60.setDate(future60.getDate() + 60);

  await Booking.create([
    {
      boardId: boards[1]._id,
      clientName: "Pak Motors",
      startDate: past30,
      endDate: in10,
      agreedPrice: 960000,
      depositStatus: "PAID",
      createdById: admin._id,
    },
    {
      boardId: boards[2]._id,
      clientName: "FreshMart",
      startDate: now,
      endDate: future60,
      agreedPrice: 420000,
      depositStatus: "PENDING",
      createdById: sales._id,
    },
  ]);

  boards[1].status = "BOOKED";
  boards[1].bookedUntil = in10;
  await boards[1].save();

  boards[2].status = "BOOKED";
  boards[2].bookedUntil = future60;
  await boards[2].save();

  await Lead.create([
    {
      source: "QUOTE",
      name: "Ali Raza",
      phone: "03001234567",
      cityInterested: "Karachi",
      boardId: boards[0]._id,
      status: "NEW",
      quoteTotal: 195000,
      quoteMonths: 1,
    },
    {
      source: "CONTACT",
      name: "Sara Khan",
      phone: "03219876543",
      cityInterested: "Lahore",
      status: "CONTACTED",
      notes: "Asked about Q2 campaign",
    },
  ]);

  await Testimonial.create([
    {
      clientName: "Hassan Ahmed",
      company: "Urban Brew",
      quote:
        "Waqas Advertisers put our launch on Faisal Corridor and foot traffic jumped in week one.",
      active: true,
      displayOrder: 1,
    },
    {
      clientName: "Nadia Iqbal",
      company: "GlowCare",
      quote:
        "Clear availability, honest pricing, and boards that actually match the brief.",
      active: true,
      displayOrder: 2,
    },
    {
      clientName: "Omar Sheikh",
      company: "DriveNow",
      quote:
        "Digital slot on Clifton performed better than our social spend that quarter.",
      active: true,
      displayOrder: 3,
    },
  ]);

  await Faq.create([
    {
      question: "How long does it take to get a board live?",
      answer:
        "Most static boards go live within 5–7 working days after creative approval and deposit.",
      active: true,
      displayOrder: 1,
    },
    {
      question: "Do you handle design?",
      answer:
        "Yes. A design fee is included in quotes and covers production-ready artwork for the selected board format.",
      active: true,
      displayOrder: 2,
    },
    {
      question: "Can I book multiple cities?",
      answer:
        "Absolutely. Ask sales for a multi-city package — duration discounts stack with board-type rates.",
      active: true,
      displayOrder: 3,
    },
    {
      question: "Is the listed price final?",
      answer:
        "Listed monthly rates feed a live quote calculator. Final agreed price is confirmed on the booking contract.",
      active: true,
      displayOrder: 4,
    },
  ]);

  console.log("Seed complete");
  console.log("Admin: admin@waqasadvertisers.com / admin123");
  console.log("Sales: sales@waqasadvertisers.com / sales123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
