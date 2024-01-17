import { z } from "zod";
const LogData = z.object({
  level: z.enum(["info", "debug", "error"]).refine((val) => val != null),
  data: z.unknown(),
  timestamp: z.string().transform((str) => new Date(str)),
  appId: z.string().min(1),
  streamId: z.string().min(1),
});

export default LogData;
