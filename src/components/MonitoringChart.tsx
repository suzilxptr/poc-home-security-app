import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Device } from '../types';

interface ChartDataPoint {
  time: string;
  online: number;
  offline: number;
  timestamp: number;
}

interface MonitoringChartProps {
  devices: Device[];
}

export const MonitoringChart: React.FC<MonitoringChartProps> = ({ devices }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();

      const onlineCount = devices.filter((d) => {
        const timeSinceLastInform = Date.now() - (d._lastInform || 0);
        return timeSinceLastInform < 5 * 60 * 1000;
      }).length;

      const offlineCount = devices.length - onlineCount;

      setChartData((prev) => {
        const newData = [
          ...prev,
          {
            time: timeStr,
            online: onlineCount,
            offline: offlineCount,
            timestamp: Date.now(),
          },
        ];

        // Keep only last 60 data points
        return newData.slice(-60);
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [devices]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Device Status Over Time
      </h3>

      {chartData.length < 2 ? (
        <div className="h-80 flex items-center justify-center text-slate-500">
          <p>Loading monitoring data...</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}
              formatter={(value) => `${value} device${value !== 1 ? 's' : ''}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="online"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Online"
            />
            <Line
              type="monotone"
              dataKey="offline"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Offline"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
