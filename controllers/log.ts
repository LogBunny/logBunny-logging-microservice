import { Request, Response } from "express";
import LogData from "../validators/log";
import { LogsQueue } from "../utils/bullmq_utils";
import { PubSub, RedisClient } from "../utils/redis_utils";
import { Log } from "../utils/db_utils";

class Logs {
  public static CreateNewLog(req: Request, res: Response) {
    let validatedData;
    try {
      validatedData = LogData.parse(req.body);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "failed to parse request body:", log: error });
    }
    LogsQueue.add("log", validatedData);
    RedisClient.publish("log", JSON.stringify(validatedData));
    return res.status(201).json({ status: "added" });
  }

  public static async GetLogs(req: Request, res: Response) {
    try {
      //filters
      const filter: Record<string, any> = {};
      if (req.query.level) {
        filter.level = req.query.level;
      }
      if (req.query.msg_regex) {
        filter.message = {
          $regex: new RegExp(req.query.msg_regex.toString(), "i"),
        };
      }
      if (req.query.resource_id) {
        filter.resourceId = req.query.resource_id;
      }
      if (req.query.trace_id) {
        filter.traceId = req.query.trace_id;
      }
      if (req.query.span_id) {
        filter.spanId = req.query.span_id;
      }
      if (req.query.commit) {
        filter.commit = req.query.commit;
      }
      if (req.query.parent_resource_id) {
        filter["metadata.parentResourceId"] = req.query.parent_resource_id;
      }
      if (req.query.timestamp) {
        filter.timestamp = new Date(req.query.timestamp.toString());
      }

      if (req.query.from_timestamp && req.query.to_timestamp) {
        filter.timestamp = {
          $gte: new Date(req.query.from_timestamp.toString()),
          $lte: new Date(req.query.to_timestamp.toString()),
        };
      } else if (req.query.from_timestamp) {
        filter.timestamp = {
          $gte: new Date(req.query.from_timestamp.toString()),
        };
      } else if (req.query.to_timestamp) {
        filter.timestamp = {
          $lte: new Date(req.query.to_timestamp.toString()),
        };
      } else if (req.query.appId) {
        filter.appId = req.query.appId;
      } else if (req.query.streamId) {
        filter.streamId = req.query.streamId;
      }

      const logs = await Log.find(filter);
      res.status(200).json({ data: logs });
    } catch (error) {
      console.log("Error fetching logs: ", error);
      res.status(500).json({ error: "Internal server error", log: error });
    }
  }

  public static StreamLogs(req: Request, res: Response) {
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    };
    res.writeHead(200, headers);
    const generate = (message: any) => {
      try {
        const logData = JSON.parse(message);
        //filters
        const filter: Record<string, any> = {};
        if (req.query.level) {
          filter.level = req.query.level;
        }
        if (req.query.msg_regex) {
          filter.message = {
            $regex: new RegExp(req.query.msg_regex.toString(), "i"),
          };
        }
        if (req.query.resource_id) {
          filter.resourceId = req.query.resource_id;
        }
        if (req.query.trace_id) {
          filter.traceId = req.query.trace_id;
        }
        if (req.query.span_id) {
          filter.spanId = req.query.span_id;
        }
        if (req.query.commit) {
          filter.commit = req.query.commit;
        }
        if (req.query.parent_resource_id) {
          filter["metadata.parentResourceId"] = req.query.parent_resource_id;
        }
        if (req.query.appId) {
          filter.appId = req.query.appId;
        }
        if (req.query.streamId) {
          filter.streamId = req.query.streamId;
        }

        const matchesFilter = Object.entries(filter).every(([key, value]) => {
          if (key === "message" && value.$regex) {
            return value.$regex.test(logData[key]);
          } else {
            return logData[key] === value;
          }
        });
        if (matchesFilter) {
          res.write(`data: ${JSON.stringify(logData)}\n\n`);
        }
      } catch (error) {
        console.error("An error occured", error);
        res.write(`error: Internal server error ${error}\n\n`);
      }
    };
    PubSub.subscribe("log", generate);
    req.on("close", () => {
      PubSub.removeListener("message", generate);
      res.end();
    });
  }
}

export default Logs;
