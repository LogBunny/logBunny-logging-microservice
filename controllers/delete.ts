import { Log } from "../utils/db_utils";

export async function deleteLogs() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  try {
    const result = await Log.deleteMany({
      timestamp: {
        $gte: weekAgo,
      },
    });
    console.log(`Deleted ${result.deletedCount} entries.`);
  } catch (e) {
    console.error("Error deleting old entries:", e);
  }
}
