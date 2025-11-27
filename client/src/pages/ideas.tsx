import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Lightbulb, Rocket, CheckCircle2, Archive, Tag, Sparkles, Star, Eye } from "lucide-react";
import type { Idea } from "@shared/schema";
import { format } from "date-fns";

const categories = [
  { value: "feature", label: "Feature Idea", icon: Rocket },
  { value: "project", label: "Project", icon: Lightbulb },
  { value: "business", label: "Business", icon: Star },
  { value: "personal", label: "Personal", icon: Sparkles },
  { value: "other", label: "Other", icon: Tag },
];

const statuses = [
  { value: "concept", label: "Concept", color: "bg-slate-500/10 text-slate-700 dark:text-slate-400" },
  { value: "exploring", label: "Exploring", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { value: "planned", label: "Planned", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { value: "completed", label: "Completed", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { value: "archived", label: "Archived", color: "bg-gray-500/10 text-gray-700 dark:text-gray-400" },
];

function IdeaForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const createIdea = useMutation({
    mutationFn: (data: Partial<Idea>) => apiRequest("/api/ideas", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({ title: "Idea captured!" });
      setOpen(false);
      setTags([]);
      onSuccess();
    },
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createIdea.mutate({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      status: "concept",
      priority: parseInt(formData.get("priority") as string) || 0,
      tags,
      notes: formData.get("notes") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 shadow-lg" data-testid="button-capture-idea">
          <Plus className="h-5 w-5" /> Capture Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Capture New Idea</DialogTitle>
          <DialogDescription>Quick capture your thought before it slips away.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="What's your idea?" required data-testid="input-idea-title" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe your idea in more detail..." rows={3} data-testid="input-idea-description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="personal">
                <SelectTrigger data-testid="select-idea-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-5)</Label>
              <Select name="priority" defaultValue="3">
                <SelectTrigger data-testid="select-idea-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 - Critical</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="1">1 - Someday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  {tag} ×
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              placeholder="Type and press Enter to add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              data-testid="input-idea-tags"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any context, links, or related thoughts..." rows={2} data-testid="input-idea-notes" />
          </div>
          <Button type="submit" className="w-full" disabled={createIdea.isPending} data-testid="button-save-idea">
            {createIdea.isPending ? "Saving..." : "Save Idea"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IdeaCard({ idea }: { idea: Idea }) {
  const category = categories.find((c) => c.value === idea.category);
  const status = statuses.find((s) => s.value === idea.status);
  const CategoryIcon = category?.icon || Lightbulb;

  const updateIdea = useMutation({
    mutationFn: (data: Partial<Idea>) => apiRequest(`/api/ideas/${idea.id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/ideas"] }),
  });

  const priorityStars = Array.from({ length: idea.priority || 0 }, (_, i) => i);

  return (
    <Card className="hover-elevate group" data-testid={`card-idea-${idea.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CategoryIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold line-clamp-1">{idea.title}</p>
                {idea.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{idea.description}</p>}
              </div>
              <Badge className={status?.color || ""} variant="secondary">
                {status?.label || idea.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {priorityStars.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {priorityStars.map((i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
              {idea.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">{format(new Date(idea.createdAt!), "d MMM yyyy")}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Select
                  value={idea.status}
                  onValueChange={(value) => updateIdea.mutate({ status: value })}
                >
                  <SelectTrigger className="h-7 w-28 text-xs" data-testid={`select-status-${idea.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Ideas() {
  const [filter, setFilter] = useState<string>("all");

  const { data: ideas = [], isLoading } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  const filteredIdeas = ideas.filter((idea) => {
    if (filter === "all") return idea.status !== "archived";
    if (filter === "archived") return idea.status === "archived";
    return idea.status === filter;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    const priorityDiff = (b.priority || 0) - (a.priority || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
  });

  const ideaCounts = {
    all: ideas.filter((i) => i.status !== "archived").length,
    concept: ideas.filter((i) => i.status === "concept").length,
    exploring: ideas.filter((i) => i.status === "exploring").length,
    in_progress: ideas.filter((i) => i.status === "in_progress").length,
    completed: ideas.filter((i) => i.status === "completed").length,
    archived: ideas.filter((i) => i.status === "archived").length,
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Idea Vault</h1>
            <p className="text-muted-foreground">Capture, organize, and develop your ideas</p>
          </div>
          <IdeaForm onSuccess={() => {}} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { key: "all", label: "All Active" },
            { key: "concept", label: "Concepts" },
            { key: "exploring", label: "Exploring" },
            { key: "in_progress", label: "In Progress" },
            { key: "completed", label: "Completed" },
            { key: "archived", label: "Archived" },
          ].map((tab) => (
            <Card
              key={tab.key}
              className={`cursor-pointer transition-all ${filter === tab.key ? "ring-2 ring-primary" : "hover-elevate"}`}
              onClick={() => setFilter(tab.key)}
              data-testid={`filter-${tab.key}`}
            >
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{ideaCounts[tab.key as keyof typeof ideaCounts] || 0}</p>
                <p className="text-xs text-muted-foreground">{tab.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : sortedIdeas.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Lightbulb className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-xl font-medium mb-2">No ideas yet</p>
              <p className="text-muted-foreground mb-6">Capture your first idea to get started</p>
              <IdeaForm onSuccess={() => {}} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
