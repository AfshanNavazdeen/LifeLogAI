import { InsightCard } from "@/components/insight-card";
import { ChatInterface } from "@/components/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Sparkles } from "lucide-react";

//todo: remove mock functionality
const mockInsights = [
  {
    title: "Fuel efficiency improving",
    summary: "Your car's fuel efficiency increased by 8% this month compared to last month.",
    details: "Based on your odometer readings and fuel purchase data, you're now averaging 10.4 km/l compared to 9.6 km/l last month. This improvement could be due to highway driving or recent maintenance.",
    severity: "success" as const,
  },
  {
    title: "Spending spike detected",
    summary: "Your spending increased by 22% this week.",
    details: "You typically spend £150/week but this week you've spent £183. The increase is mainly from groceries (£87) and fuel (£58). Consider reviewing your budget.",
    severity: "warning" as const,
  },
  {
    title: "Similar situation detected",
    summary: "This feels similar to your experience on Feb 14, 2024.",
    details: "You previously handled work stress by taking a break and speaking with a friend. You noted feeling relieved and more focused after doing so. Consider the same approach.",
    severity: "info" as const,
  },
  {
    title: "Pattern: Weekend spending",
    summary: "You spend 35% more on weekends than weekdays.",
    details: "Over the past 3 months, your weekend spending averages £87 compared to £64 on weekdays. Most of the difference comes from dining and entertainment.",
    severity: "info" as const,
  },
  {
    title: "Maintenance reminder",
    summary: "Your car is due for service soon.",
    details: "Based on your odometer readings, you've driven 4,850 km since your last oil change. Most manufacturers recommend service every 5,000 km.",
    severity: "warning" as const,
  },
  {
    title: "Emotional pattern",
    summary: "Stress levels correlate with work deadlines.",
    details: "Your logged emotional entries show increased stress 3-5 days before major deadlines. You've found success managing this with breaks and early planning.",
    severity: "info" as const,
  },
];

export default function Insights() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Insights</h1>
        <p className="text-muted-foreground">
          Personalized insights and ask anything about your data
        </p>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="insights" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Ask AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {mockInsights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <div className="border rounded-lg h-[600px] overflow-hidden">
            <ChatInterface />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
