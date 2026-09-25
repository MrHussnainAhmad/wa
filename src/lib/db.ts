import dns from "dns";
import os from "os";
import mongoose from "mongoose";

// Local Windows / some ISP resolvers refuse MongoDB SRV lookups.
// Do not override DNS on Vercel — it slows cold connects.
if (os.platform() === "win32") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    /* ignore */
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      // IPv6-first lookups often stall ~10s before falling back to IPv4
      family: 4,
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
