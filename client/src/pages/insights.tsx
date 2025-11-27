import { useQuery } from "@tanstack/react-query";
import { InsightCard } from "@/components/insight-card";
import { ChatInterface } from "@/components/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Sparkles } from "lucide-react";
import type { Insight } from "@shared/schema";

export default function Insights() {
  const { data: insights = [], isLoading } = useQuery<Insight[]>({
    queryKey: ["/api/insights"],
  });

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Insights</h1>
          <p className="text-muted-foreground">
            Personalized insights and ask anything about your data
          </p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="chat" className="gap-2" data-testid="tab-chat">
              <MessageSquare className="h-4 w-4" />
              Ask AI
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2" data-testid="tab-insights">
              <Sparkles className="h-4 w-4" />
              Insights {insights.length > 0 && `(${insights.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <div className="border rounded-lg h-[600px] overflow-hidden">
              <ChatInterface />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : insights.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">No insights yet</p>
                  <p className="text-muted-foreground">
                    Add more entries to get AI-powered insights about your patterns and habits
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {insights.map((insight) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
