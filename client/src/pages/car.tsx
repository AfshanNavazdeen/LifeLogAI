import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, TrendingUp, Wrench, Plus, Car as CarIcon } from "lucide-react";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CarData } from "@shared/schema";
import { format } from "date-fns";

export default function Car() {
  const { data: carData = [], isLoading } = useQuery<CarData[]>({
    queryKey: ["/api/car"],
  });

  const sortedData = [...carData].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const latestOdometer = sortedData[0]?.odometerReading || 0;
  
  const totalFuelCost = sortedData
    .filter((d) => {
      const date = new Date(d.timestamp);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, d) => sum + (d.fuelCost ? parseFloat(String(d.fuelCost)) : 0), 0);

  const chartData = sortedData.slice(0, 10).reverse().map((d) => ({
    date: format(new Date(d.timestamp), "MMM d"),
    odometer: d.odometerReading,
    cost: d.fuelCost ? parseFloat(String(d.fuelCost)) : 0,
  }));

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Car Data</h1>
            <p className="text-muted-foreground">
              Track your vehicle's fuel efficiency and maintenance
            </p>
          </div>
          <Link href="/upload">
            <Button className="gap-2" data-testid="button-add-car-data">
              <Plus className="h-4 w-4" /> Log Car Data
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <StatCard
              icon={Gauge}
              label="Current Odometer"
              value={latestOdometer ? latestOdometer.toLocaleString() + " km" : "No data"}
              className="font-mono"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Readings"
              value={carData.length.toString()}
            />
            <StatCard
              icon={Fuel}
              label="Fuel This Month"
              value={`£${totalFuelCost.toFixed(2)}`}
            />
            <StatCard
              icon={Wrench}
              label="Latest Entry"
              value={sortedData[0] ? format(new Date(sortedData[0].timestamp), "MMM d") : "None"}
            />
          </div>
        )}

        {!isLoading && carData.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-xl font-medium mb-2">No car data yet</p>
              <p className="text-muted-foreground mb-6">Start tracking your odometer readings and fuel purchases</p>
              <Link href="/upload">
                <Button data-testid="button-add-first-car-data">
                  <Plus className="h-4 w-4 mr-2" />
                  Log your first reading
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {chartData.length > 1 && (
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Odometer Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" />
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
                          dataKey="odometer"
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
                    <CardTitle>Fuel Cost History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData.filter((d) => d.cost > 0)}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" />
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
            )}

            {sortedData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedData.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                        data-testid={`car-entry-${entry.id}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium font-mono">{entry.odometerReading.toLocaleString()} km</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(entry.timestamp), "EEEE, MMMM d, yyyy")}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                          )}
                        </div>
                        {(entry.fuelAmount || entry.fuelCost) && (
                          <div className="text-right">
                            {entry.fuelCost && (
                              <p className="font-bold font-mono">£{parseFloat(String(entry.fuelCost)).toFixed(2)}</p>
                            )}
                            {entry.fuelAmount && (
                              <p className="text-sm text-muted-foreground">{parseFloat(String(entry.fuelAmount)).toFixed(1)}L</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
