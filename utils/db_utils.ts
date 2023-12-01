import mongoose from "mongoose";
import LogSchema from "../models/log";

export type LogDocument = mongoose.Document & {
  level: string;
  message: string;
  resourceId: string;
  timestamp: Date;
  traceId: string;
  spanId: string;
  commit: string;
  metaData: {
    parentResourceId: string;
  };
};

export default function DBInit() {
  console.info(process.env.MONGO_URI);
  mongoose.connect(process.env.MONGO_URI!);

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error", err);
    //Log.error('MongoDB connection error: ' + err);
    process.exit();
  });
  mongoose.connection.on("connected", () => {
    console.info("Connected to mongoDB");
  });
  mongoose.connection.on("disconnected", () => {
    console.info("Disconnected from MongoDB");
  });
}

export const Log = mongoose.model<LogDocument>("Log", LogSchema);
//indices for faster lookup
Log.collection.createIndex("level");
Log.collection.createIndex("resourceId");
Log.collection.createIndex("traceId");
Log.collection.createIndex("commit");
