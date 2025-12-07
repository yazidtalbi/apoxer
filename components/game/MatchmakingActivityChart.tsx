"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { getMatchmakingActivity, MatchmakingDataPoint, TimeRange } from "@/lib/matchmaking-activity";

interface MatchmakingActivityChartProps {
  gameId: string;
}

export default function MatchmakingActivityChart({ gameId }: MatchmakingActivityChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [data, setData] = useState<MatchmakingDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const activityData = await getMatchmakingActivity(gameId, timeRange);
        setData(activityData);

        // Set date range for display
        if (activityData.length > 0) {
          const firstDate = new Date(activityData[0].timestamp);
          const lastDate = new Date(activityData[activityData.length - 1].timestamp);
          setFromDate(firstDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
          setToDate(lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
        }
      } catch (error) {
        console.error("Error loading matchmaking activity:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [gameId, timeRange]);

  const formatXAxisLabel = (value: string) => {
    try {
      let date: Date;
      if (value.includes(":")) {
        // Hour format: "YYYY-MM-DD HH:00"
        date = new Date(value.replace(" ", "T") + ":00");
      } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Day format: "YYYY-MM-DD"
        date = new Date(value + "T00:00:00");
      } else if (value.match(/^\d{4}-\d{2}$/)) {
        // Month format: "YYYY-MM"
        date = new Date(value + "-01T00:00:00");
      } else {
        date = new Date(value);
      }

      if (isNaN(date.getTime())) {
        return value;
      }

      if (timeRange === "48h") {
        // Show day and hour
        return `${date.getDate()}. ${date.toLocaleDateString("en-US", { month: "short" })} ${date.getHours()}:00`;
      } else if (timeRange === "7d" || timeRange === "1m") {
        // Show day and month
        return `${date.getDate()}. ${date.toLocaleDateString("en-US", { month: "short" })}`;
      } else {
        // Show month and year
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } catch {
      return value;
    }
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: "48h", label: "48h" },
    { value: "7d", label: "7d" },
    { value: "1m", label: "1m" },
    { value: "3m", label: "3m" },
    { value: "6m", label: "6m" },
    { value: "1y", label: "1y" },
    { value: "all", label: "All" },
  ];

  if (loading) {
    return (
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
        <p className="text-white/60 text-sm">Loading matchmaking activity...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6 text-center">
        <p className="text-white/60 text-sm">No matchmaking activity data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0E0E0E] border border-white/10 rounded-lg p-6">
      <div className="mb-6">
        {/* Header with Zoom Controls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Matchmaking Activity</h2>
          <div className="flex items-center gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  timeRange === range.value
                    ? "bg-white text-black border border-white"
                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        {fromDate && toDate && (
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <span>From {fromDate}</span>
            <span>•</span>
            <span>To {toDate}</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisLabel}
              stroke="#ffffff40"
              tick={{ fill: "#ffffff60", fontSize: 12 }}
            />
            <YAxis
              stroke="#ffffff40"
              tick={{ fill: "#ffffff60", fontSize: 12 }}
              label={{ value: "Players", angle: -90, position: "insideLeft", fill: "#ffffff60" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A1A",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelFormatter={(value) => formatXAxisLabel(value)}
              formatter={(value: number) => [value, "Players"]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Historical Overview (Area Chart) */}
      {timeRange !== "all" && (
        <div className="mt-8">
          <div className="w-full h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxisLabel}
                  stroke="#ffffff20"
                  tick={{ fill: "#ffffff40", fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorActivity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

