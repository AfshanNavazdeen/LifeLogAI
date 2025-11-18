import { StatCard } from "@/components/stat-card";
import { InsightCard } from "@/components/insight-card";
import { TimelineEntry } from "@/components/timeline-entry";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Fuel, TrendingUp, Plus, Calendar, Heart, Sparkles } from "lucide-react";
import { Link } from "wouter";

//todo: remove mock functionality
const mockStats = [
  { 
    icon: DollarSign, 
    label: "Total Spending", 
    value: "£1,847", 
    change: "12%", 
    trend: "up" as const,
    gradient: "from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"
  },
  { 
    icon: Fuel, 
    label: "Fuel This Month", 
    value: "£182", 
    change: "5%", 
    trend: "down" as const,
    gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20"
  },
  { 
    icon: TrendingUp, 
    label: "Entries", 
    value: "47", 
    change: "23%", 
    trend: "up" as const,
    gradient: "from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20"
  },
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

//todo: remove mock functionality
const quickStats = [
  { icon: Calendar, label: "This Week", value: "12 entries" },
  { icon: Heart, label: "Mood", value: "Positive" },
  { icon: Sparkles, label: "Insights", value: "6 new" },
];

export default function Dashboard() {
  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Overview of your life activity and insights
            </p>
          </div>
          <Link href="/upload">
            <Button size="lg" className="gap-2 shadow-lg" data-testid="button-quick-add">
              <Plus className="h-5 w-5" />
              Quick Add
            </Button>
          </Link>
        </div>

        {/* Main Stats with Gradients */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {mockStats.map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-lg p-1`}>
              <StatCard {...stat} className="bg-card border-0" />
            </div>
          ))}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="hover-elevate">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-lg font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Insights Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
            <h2 className="text-2xl font-semibold">AI Insights</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {mockInsights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
            </div>
            <Link href="/timeline">
              <Button variant="ghost" size="lg" data-testid="link-view-all">
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
    </div>
  );
}
