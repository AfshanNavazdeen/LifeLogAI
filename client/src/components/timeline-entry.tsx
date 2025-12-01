import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Fuel, 
  ShoppingCart, 
  Heart, 
  Calendar,
  Wrench,
  Receipt,
  LucideIcon
} from "lucide-react";

export type EntryCategory = "fuel" | "groceries" | "life-event" | "emotion" | "car-maintenance" | "other";

interface TimelineEntryProps {
  id: string;
  category: EntryCategory;
  timestamp: Date;
  title: string;
  amount?: number;
  description?: string;
  tags?: string[];
  thumbnail?: string;
}

const categoryConfig: Record<EntryCategory, { icon: LucideIcon; label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  fuel: { icon: Fuel, label: "Fuel", variant: "default" },
  groceries: { icon: ShoppingCart, label: "Groceries", variant: "secondary" },
  "life-event": { icon: Calendar, label: "Life Event", variant: "outline" },
  emotion: { icon: Heart, label: "Emotion", variant: "destructive" },
  "car-maintenance": { icon: Wrench, label: "Car", variant: "default" },
  other: { icon: Receipt, label: "Other", variant: "secondary" },
};

export function TimelineEntry({
  category,
  timestamp,
  title,
  amount,
  description,
  tags,
  thumbnail,
}: TimelineEntryProps) {
  const config = categoryConfig[category] || categoryConfig.other;
  const Icon = config.icon;

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <Badge variant={config.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
        <span className="text-xs font-mono text-muted-foreground" data-testid="timestamp">
          {format(timestamp, "MMM dd, yyyy HH:mm")}
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {thumbnail && (
            <div className="shrink-0">
              <div className="h-16 w-16 rounded-md bg-muted" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-medium" data-testid="entry-title">{title}</h3>
              {amount !== undefined && (
                <span className="text-lg font-bold font-mono shrink-0" data-testid="entry-amount">
                  £{amount.toFixed(2)}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {description}
              </p>
            )}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs rounded-full"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
