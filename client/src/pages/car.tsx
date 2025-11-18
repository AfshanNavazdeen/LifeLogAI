import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Fuel, Gauge, TrendingUp, Wrench } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

//todo: remove mock functionality
const fuelData = [
  { month: "Jul", efficiency: 9.2, cost: 165 },
  { month: "Aug", efficiency: 9.5, cost: 172 },
  { month: "Sep", efficiency: 9.8, cost: 168 },
  { month: "Oct", efficiency: 10.1, cost: 175 },
  { month: "Nov", efficiency: 10.4, cost: 182 },
];

export default function Car() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Car Data</h1>
        <p className="text-muted-foreground">
          Track your vehicle's fuel efficiency and maintenance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <StatCard
          icon={Gauge}
          label="Current Odometer"
          value="45,230"
          className="font-mono"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Efficiency"
          value="10.4 km/L"
          change="8%"
          trend="up"
        />
        <StatCard
          icon={Fuel}
          label="Fuel This Month"
          value="£182"
          change="5%"
          trend="down"
        />
        <StatCard
          icon={Wrench}
          label="Last Service"
          value="380 km ago"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Efficiency Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Fuel Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Fuel Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Nov 15, 2024", station: "Shell - M4", amount: 45.2, cost: 58.42, odometer: 45230 },
              { date: "Nov 8, 2024", station: "BP - Local", amount: 38.5, cost: 49.87, odometer: 44892 },
              { date: "Nov 1, 2024", station: "Esso - A1", amount: 42.8, cost: 55.34, odometer: 44561 },
            ].map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
              >
                <div className="flex-1">
                  <p className="font-medium">{entry.station}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {entry.date} • Odometer: {entry.odometer.toLocaleString()} km
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono">£{entry.cost.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{entry.amount}L</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
