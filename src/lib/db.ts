import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDb() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  if (cached.conn) {
    return cached.conn;
  }

  cached.promise ??= mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  cached.conn = await cached.promise;
  return cached.conn;
}
