import { TimelineEntry, EntryCategory } from "@/components/timeline-entry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

//todo: remove mock functionality
const mockEntries = [
  {
    id: "1",
    category: "fuel" as EntryCategory,
    timestamp: new Date("2024-11-15T14:30:00"),
    title: "Shell Station - M4",
    amount: 58.42,
    description: "Full tank, 45.2L",
    tags: ["verified", "auto-categorized"],
  },
  {
    id: "2",
    category: "groceries" as EntryCategory,
    timestamp: new Date("2024-11-14T18:15:00"),
    title: "Tesco Superstore",
    amount: 87.23,
    tags: ["weekly-shop"],
  },
  {
    id: "3",
    category: "life-event" as EntryCategory,
    timestamp: new Date("2024-11-13T09:00:00"),
    title: "Work presentation went well",
    description: "Felt nervous beforehand but received positive feedback from the team.",
    tags: ["achievement", "work", "positive"],
  },
  {
    id: "4",
    category: "car-maintenance" as EntryCategory,
    timestamp: new Date("2024-11-12T10:30:00"),
    title: "Oil change at Kwik Fit",
    amount: 45.0,
    tags: ["maintenance", "scheduled"],
  },
  {
    id: "5",
    category: "emotion" as EntryCategory,
    timestamp: new Date("2024-11-11T20:15:00"),
    title: "Feeling stressed about deadlines",
    description: "Work pressure building up. Need to take a break and reorganize priorities.",
    tags: ["stress", "work-related"],
  },
];

const categories: EntryCategory[] = ["fuel", "groceries", "life-event", "emotion", "car-maintenance", "other"];

export default function Timeline() {
  const [selectedCategory, setSelectedCategory] = useState<EntryCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = mockEntries.filter((entry) => {
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Timeline</h1>
        <p className="text-muted-foreground">
          Your complete activity history
        </p>
      </div>

      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-6 space-y-4">
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

      <div>
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No entries found</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <TimelineEntry key={entry.id} {...entry} />
          ))
        )}
      </div>
    </div>
  );
}
