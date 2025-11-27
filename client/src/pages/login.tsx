import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Shield, Zap, BarChart3 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();

  const features = [
    { icon: Sparkles, title: "AI-Powered", description: "Automatic categorization and insights" },
    { icon: Shield, title: "Privacy-First", description: "Your data stays secure and private" },
    { icon: Zap, title: "Quick Capture", description: "Log anything in seconds" },
    { icon: BarChart3, title: "Smart Analytics", description: "Understand your patterns" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              LifeLog AI
            </h1>
            <p className="text-xl text-muted-foreground">
              Your intelligent personal life-management companion
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                <feature.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to access your personal life dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={login} 
              className="w-full h-12 text-lg gap-2"
              data-testid="button-login"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Sign in with Replit
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our privacy-first approach. Your data is encrypted and never shared.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
