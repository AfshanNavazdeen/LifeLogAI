import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/stat-card";
import { InsightCard } from "@/components/insight-card";
import { TimelineEntry } from "@/components/timeline-entry";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Fuel, TrendingUp, Plus, Calendar, Heart, Sparkles, Lightbulb, Stethoscope } from "lucide-react";
import { Link } from "wouter";
import type { Entry, Insight, FollowUpTask, Idea } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  totalSpending: string;
  fuelSpending: string;
  entryCount: number;
  thisMonthCount: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: entries = [], isLoading: loadingEntries } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const { data: insights = [], isLoading: loadingInsights } = useQuery<Insight[]>({
    queryKey: ["/api/insights"],
  });

  const { data: followUps = [] } = useQuery<FollowUpTask[]>({
    queryKey: ["/api/medical/follow-ups"],
  });

  const { data: ideas = [] } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  const recentEntries = entries.slice(0, 5);
  const upcomingFollowUps = followUps.filter((f) => f.status !== "completed").length;
  const activeIdeas = ideas.filter((i) => i.status !== "archived" && i.status !== "completed").length;
  
  const statCards = [
    { 
      icon: DollarSign, 
      label: "Total Spending", 
      value: stats ? `£${parseFloat(stats.totalSpending).toLocaleString()}` : "£0", 
      change: "this month", 
      trend: "up" as const,
      gradient: "from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"
    },
    { 
      icon: Fuel, 
      label: "Fuel This Month", 
      value: stats ? `£${parseFloat(stats.fuelSpending).toLocaleString()}` : "£0", 
      change: "", 
      trend: "neutral" as const,
      gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20"
    },
    { 
      icon: TrendingUp, 
      label: "Total Entries", 
      value: stats ? stats.entryCount.toString() : "0", 
      change: `${stats?.thisMonthCount || 0} this month`, 
      trend: "up" as const,
      gradient: "from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20"
    },
  ];

  const quickStats = [
    { icon: Calendar, label: "This Month", value: `${stats?.thisMonthCount || 0} entries` },
    { icon: Stethoscope, label: "Follow-ups", value: `${upcomingFollowUps} pending` },
    { icon: Lightbulb, label: "Ideas", value: `${activeIdeas} active` },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {user?.firstName ? `Hi, ${user.firstName}` : "Your Dashboard"}
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

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {loadingStats ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </>
          ) : (
            statCards.map((stat) => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.gradient} rounded-lg p-1`}>
                <StatCard {...stat} className="bg-card border-0" />
              </div>
            ))
          )}
        </div>

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

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full" />
            <h2 className="text-2xl font-semibold">AI Insights</h2>
          </div>
          {loadingInsights ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No insights yet</p>
                <p className="text-sm text-muted-foreground">Add more entries to get AI-powered insights</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {insights.slice(0, 4).map((insight) => (
                <InsightCard
                  key={insight.id}
                  title={insight.title}
                  summary={insight.summary}
                  details={insight.details}
                  severity={insight.severity as "info" | "success" | "warning" | "error"}
                />
              ))}
            </div>
          )}
        </div>

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
          {loadingEntries ? (
            <div className="space-y-4 max-w-4xl">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : recentEntries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No entries yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start tracking your life activities</p>
                <Link href="/upload">
                  <Button data-testid="button-add-first-entry">
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first entry
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-4xl">
              {recentEntries.map((entry) => (
                <TimelineEntry
                  key={entry.id}
                  id={entry.id}
                  category={entry.category as any}
                  timestamp={new Date(entry.timestamp)}
                  title={entry.title}
                  amount={entry.amount ? parseFloat(entry.amount) : undefined}
                  tags={entry.tags || []}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
