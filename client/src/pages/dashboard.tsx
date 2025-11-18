import { StatCard } from "@/components/stat-card";
import { InsightCard } from "@/components/insight-card";
import { TimelineEntry } from "@/components/timeline-entry";
import { Button } from "@/components/ui/button";
import { DollarSign, Fuel, TrendingUp, Plus } from "lucide-react";
import { Link } from "wouter";

//todo: remove mock functionality
const mockStats = [
  { icon: DollarSign, label: "Total Spending", value: "£1,847", change: "12%", trend: "up" as const },
  { icon: Fuel, label: "Fuel This Month", value: "£182", change: "5%", trend: "down" as const },
  { icon: TrendingUp, label: "Entries", value: "47", change: "23%", trend: "up" as const },
];

//todo: remove mock functionality
const mockInsights = [
  {
    title: "Fuel efficiency improving",
    summary: "Your car's fuel efficiency increased by 8% this month.",
    details: "Based on your odometer readings, you're averaging 10.4 km/l compared to 9.6 km/l last month.",
    severity: "success" as const,
  },
  {
    title: "Spending spike detected",
    summary: "Your spending increased by 22% this week.",
    details: "You typically spend £150/week but this week you've spent £183.",
    severity: "warning" as const,
  },
];

//todo: remove mock functionality
const mockRecentEntries = [
  {
    id: "1",
    category: "fuel" as const,
    timestamp: new Date("2024-11-15T14:30:00"),
    title: "Shell Station - M4",
    amount: 58.42,
    tags: ["verified", "auto-categorized"],
  },
  {
    id: "2",
    category: "groceries" as const,
    timestamp: new Date("2024-11-14T18:15:00"),
    title: "Tesco Superstore",
    amount: 87.23,
    tags: ["weekly-shop"],
  },
];

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your life activity and insights
          </p>
        </div>
        <Link href="/upload">
          <Button className="gap-2" data-testid="button-quick-add">
            <Plus className="h-4 w-4" />
            Quick Add
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {mockStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">AI Insights</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mockInsights.map((insight, i) => (
            <InsightCard key={i} {...insight} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Activity</h2>
          <Link href="/timeline">
            <Button variant="ghost" data-testid="link-view-all">
              View all
            </Button>
          </Link>
        </div>
        <div className="max-w-4xl">
          {mockRecentEntries.map((entry) => (
            <TimelineEntry key={entry.id} {...entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
