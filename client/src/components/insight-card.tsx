import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface InsightCardProps {
  title: string;
  summary: string;
  details?: string;
  severity?: "info" | "warning" | "success";
}

export function InsightCard({
  title,
  summary,
  details,
  severity = "info",
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  const severityColors = {
    info: "border-primary/20 bg-primary/5",
    warning: "border-chart-4/20 bg-chart-4/5",
    success: "border-chart-2/20 bg-chart-2/5",
  };

  return (
    <Card className={`${severityColors[severity]}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <Badge variant="outline" className="text-xs">
            AI Insight
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2" data-testid="insight-title">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{summary}</p>
        {details && (
          <>
            {expanded && (
              <div className="text-sm border-l-2 border-primary/30 pl-3 mb-3 text-muted-foreground">
                {details}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="gap-2"
              data-testid="button-expand-insight"
            >
              {expanded ? "Show less" : "Learn more"}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
