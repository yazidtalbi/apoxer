"use client";

export interface MatchmakingDataPoint {
  date: string;
  timestamp: number;
  count: number;
}

export type TimeRange = "48h" | "7d" | "1m" | "3m" | "6m" | "1y" | "all";

/**
 * Generates local dummy matchmaking activity data for a game
 * Creates realistic-looking activity patterns without hitting the database
 */
export function getMatchmakingActivity(
  gameId: string,
  timeRange: TimeRange = "7d"
): Promise<MatchmakingDataPoint[]> {
  return new Promise((resolve) => {
    // Simulate a small delay for realism
    setTimeout(() => {
      const result = generateDummyActivity(timeRange);
      resolve(result);
    }, 100);
  });
}

/**
 * Generates simple dummy activity data based on time range
 */
function generateDummyActivity(timeRange: TimeRange): MatchmakingDataPoint[] {
  const now = new Date();
  const result: MatchmakingDataPoint[] = [];
  
  let intervals: number;
  let intervalMs: number;
  let groupBy: "hour" | "day" | "week" | "month";
  
  switch (timeRange) {
    case "48h":
      intervals = 48;
      intervalMs = 60 * 60 * 1000; // 1 hour
      groupBy = "hour";
      break;
    case "7d":
      intervals = 7;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      groupBy = "day";
      break;
    case "1m":
      intervals = 30;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      groupBy = "day";
      break;
    case "3m":
      intervals = 12; // ~12 weeks
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
      groupBy = "week";
      break;
    case "6m":
      intervals = 24; // ~24 weeks
      intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
      groupBy = "week";
      break;
    case "1y":
      intervals = 12;
      intervalMs = 30 * 24 * 60 * 60 * 1000; // ~1 month
      groupBy = "month";
      break;
    case "all":
      intervals = 24; // 2 years
      intervalMs = 30 * 24 * 60 * 60 * 1000;
      groupBy = "month";
      break;
    default:
      intervals = 7;
      intervalMs = 24 * 60 * 60 * 1000;
      groupBy = "day";
  }
  
  // Generate simple dummy data with variation
  for (let i = intervals; i >= 0; i--) {
    const timestamp = now.getTime() - (i * intervalMs);
    const date = new Date(timestamp);
    
    // Simple pattern: base value with some variation
    // Add variation based on position (create some ups and downs)
    const position = (intervals - i) / intervals; // 0 to 1
    const baseCount = 30 + Math.sin(position * Math.PI * 4) * 20; // Wave pattern
    const randomVariation = (Math.random() - 0.5) * 30; // ±15 variation
    let count = Math.floor(baseCount + randomVariation);
    
    // Ensure minimum and maximum bounds
    count = Math.max(10, Math.min(count, 120));
    
    // Format date key
    let dateKey: string;
    if (groupBy === "hour") {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      dateKey = `${date.getFullYear()}-${month}-${day} ${hour}:00`;
    } else if (groupBy === "day") {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      dateKey = `${date.getFullYear()}-${month}-${day}`;
    } else if (groupBy === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const month = String(weekStart.getMonth() + 1).padStart(2, "0");
      const day = String(weekStart.getDate()).padStart(2, "0");
      dateKey = `${weekStart.getFullYear()}-${month}-${day}`;
    } else {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      dateKey = `${date.getFullYear()}-${month}`;
    }
    
    result.push({
      date: dateKey,
      timestamp,
      count,
    });
  }
  
  // Remove duplicates and sort
  const uniqueMap = new Map<string, MatchmakingDataPoint>();
  result.forEach((point) => {
    const existing = uniqueMap.get(point.date);
    if (!existing || point.count > existing.count) {
      uniqueMap.set(point.date, point);
    }
  });
  
  return Array.from(uniqueMap.values()).sort((a, b) => a.timestamp - b.timestamp);
}

