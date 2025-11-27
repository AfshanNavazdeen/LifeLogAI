import { useQuery } from "@tanstack/react-query";
import { TimelineEntry, EntryCategory } from "@/components/timeline-entry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, Clock } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Entry } from "@shared/schema";

const categories: EntryCategory[] = ["fuel", "groceries", "life-event", "emotion", "car-maintenance", "other"];

export default function Timeline() {
  const [selectedCategory, setSelectedCategory] = useState<EntryCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ["/api/entries"],
  });

  const filteredEntries = entries.filter((entry) => {
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Timeline</h1>
          <p className="text-muted-foreground">
            Your complete activity history
          </p>
        </div>

        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-50 pb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-timeline"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              data-testid="filter-all"
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                data-testid={`filter-${cat}`}
              >
                {cat.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : sortedEntries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">
                {searchQuery || selectedCategory !== "all" ? "No entries found" : "No entries yet"}
              </p>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your filters"
                  : "Start tracking your life activities"}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Link href="/upload">
                  <Button data-testid="button-add-entry">
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first entry
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            {sortedEntries.map((entry) => (
              <TimelineEntry
                key={entry.id}
                id={entry.id}
                category={entry.category as EntryCategory}
                timestamp={new Date(entry.timestamp)}
                title={entry.title}
                description={entry.description || undefined}
                amount={entry.amount ? parseFloat(entry.amount) : undefined}
                tags={entry.tags || []}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
