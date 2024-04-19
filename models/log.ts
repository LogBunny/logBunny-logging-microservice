import { Schema } from "mongoose";

const LogSchema: Schema = new Schema({
  level: String,
  data: Object,
  timestamp: Date,
  appId: String,
  streamId: String,
});

LogSchema.set("toJSON", {
  virtuals: true,
});

export default LogSchema;
