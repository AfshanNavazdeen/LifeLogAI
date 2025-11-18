import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { Badge } from "./ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your LifeLog AI assistant. Ask me anything about your spending, habits, or life events.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    // Simulate AI response
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "I analyzed your data. " + (
        input.toLowerCase().includes("fuel") 
          ? "You spent £182 on fuel last month, which is 12% higher than your monthly average."
          : input.toLowerCase().includes("spending")
          ? "Your total spending this month is £1,847. This is an increase of 8% compared to last month."
          : "Based on your logged data, I can help you understand patterns and make better decisions."
      ),
    };

    setMessages([...messages, userMessage, aiMessage]);
    setInput("");
    console.log("Message sent:", input);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                  : "bg-muted rounded-2xl rounded-bl-sm"
              } px-4 py-3`}
            >
              {message.role === "assistant" && (
                <Badge variant="outline" className="mb-2 gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              )}
              <p className="text-sm" data-testid={`message-${message.role}`}>{message.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your data..."
            className="rounded-full"
            data-testid="input-chat"
          />
          <Button
            size="icon"
            className="rounded-full shrink-0"
            onClick={handleSend}
            data-testid="button-send-message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
