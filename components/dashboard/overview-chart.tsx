"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function OverviewChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        {/* Definisi Gradien untuk efek visual modern */}
        <defs>
          <linearGradient id='colorMasuk' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
            <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
          </linearGradient>
          <linearGradient id='colorKeluar' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#f43f5e' stopOpacity={0.3} />
            <stop offset='95%' stopColor='#f43f5e' stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray='3 3'
          vertical={false}
          stroke='#f0f0f0'
        />

        <XAxis
          dataKey='name'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke='#888888'
          dy={10}
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke='#888888'
        />

        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(4px)",
          }}
        />
        <Legend verticalAlign='top' height={36} iconType='circle' />

        {/* Area Masuk (Emerald) */}
        <Area
          type='monotone'
          dataKey='Masuk'
          stackId='1' // Membuatnya menjadi "Stacked"
          stroke='#10b981'
          strokeWidth={2}
          fillOpacity={1}
          fill='url(#colorMasuk)'
          animationDuration={1500}
        />

        {/* Area Keluar (Rose) */}
        <Area
          type='monotone'
          dataKey='Keluar'
          stackId='1' // Bertumpuk di atas "Masuk"
          stroke='#f43f5e'
          strokeWidth={2}
          fillOpacity={1}
          fill='url(#colorKeluar)'
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
