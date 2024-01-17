import { Schema } from "mongoose";

const LogSchema: Schema = new Schema({
  level: String,
  data: Object,
  timestamp: Date,
  appId: String,
  streamId: String,
});

export default LogSchema;
