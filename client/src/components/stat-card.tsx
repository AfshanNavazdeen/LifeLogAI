import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  className?: string;
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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</div>
        {change && (
          <p className="text-sm text-muted-foreground mt-1">
            <span className={trend === "up" ? "text-chart-2" : "text-destructive"}>
              {trend === "up" ? "↑" : "↓"} {change}
            </span>{" "}
            vs last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
