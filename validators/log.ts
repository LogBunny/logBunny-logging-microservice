import { z } from "zod";
const LogData = z.object({
  level: z.enum(["info", "debug", "error"]).refine((val) => val != null),
  message: z.string().min(1),
  resourceId: z.string().min(1),
  timestamp: z.string().transform((str) => new Date(str)),
  traceId: z.string().min(1),
  spanId: z.string().min(1),
  commit: z.string().min(1),
  appId: z.string().min(1),
  streamId: z.string().min(1),
  metaData: z.object({
    parentResourceId: z.string().min(1),
  }),
});

export default LogData;
