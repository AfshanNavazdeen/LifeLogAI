import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  className?: string;
  gradient?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={`hover-elevate transition-all ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold tracking-tight" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend === "up" 
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                : "bg-red-500/10 text-red-700 dark:text-red-400"
            }`}>
              {trend === "up" ? "↑" : "↓"} {change}
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
