import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UploadCard } from "@/components/upload-card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, FileText, Heart, Car, Mic, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Upload() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);

  const createEntry = useMutation({
    mutationFn: (data: any) => apiRequest("/api/entries", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Entry saved successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save entry", description: error.message, variant: "destructive" });
    },
  });

  const createCarData = useMutation({
    mutationFn: (data: any) => apiRequest("/api/car", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/car"] });
      toast({ title: "Car data saved successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save car data", description: error.message, variant: "destructive" });
    },
  });

  const handleVoiceNote = () => {
    setIsRecording(!isRecording);
    toast({ title: isRecording ? "Recording stopped" : "Recording started" });
  };

  const handleQuickNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("quickNote") as string;
    const category = formData.get("category") as string;
    if (!title.trim()) {
      toast({ title: "Please enter a note", variant: "destructive" });
      return;
    }
    createEntry.mutate({
      title,
      category: category || "other",
      description: title,
    });
    e.currentTarget.reset();
  };

  const handleLifeIncident = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const what = formData.get("what") as string;
    const feeling = formData.get("feeling") as string;
    const resolution = formData.get("resolution") as string;
    if (!what.trim()) {
      toast({ title: "Please describe what happened", variant: "destructive" });
      return;
    }
    createEntry.mutate({
      title: what,
      category: "life-event",
      description: [feeling, resolution].filter(Boolean).join("\n\n"),
      tags: ["journal"],
    });
    e.currentTarget.reset();
  };

  const handleCarData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const odometer = formData.get("odometer") as string;
    const fuelAmount = formData.get("fuelAmount") as string;
    const fuelCost = formData.get("fuelCost") as string;
    if (!odometer) {
      toast({ title: "Please enter odometer reading", variant: "destructive" });
      return;
    }
    createCarData.mutate({
      odometerReading: parseInt(odometer),
      fuelAmount: fuelAmount ? parseFloat(fuelAmount) : undefined,
      fuelCost: fuelCost ? parseFloat(fuelCost) : undefined,
    });
    if (fuelCost) {
      createEntry.mutate({
        title: `Fuel purchase - ${fuelAmount}L`,
        category: "fuel",
        amount: fuelCost,
        tags: ["auto-logged"],
      });
    }
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Upload Data</h1>
          <p className="text-muted-foreground">
            Add receipts, notes, life events, or car data
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <UploadCard
            icon={Camera}
            title="Upload Receipt"
            description="Capture or upload receipt image"
            acceptTypes="image/*"
            onUpload={(file) => {
              toast({ title: `Receipt "${file.name}" uploaded` });
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Quick Text Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickNote} className="space-y-4">
                <Textarea
                  name="quickNote"
                  placeholder="What's on your mind?"
                  className="min-h-32"
                  data-testid="textarea-quick-note"
                />
                <div className="flex items-center gap-2">
                  <Select name="category" defaultValue="other">
                    <SelectTrigger className="w-40" data-testid="select-note-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other">General</SelectItem>
                      <SelectItem value="life-event">Life Event</SelectItem>
                      <SelectItem value="emotion">Emotion</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleVoiceNote}
                    data-testid="button-voice-note"
                    className={isRecording ? "bg-destructive text-destructive-foreground" : ""}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button type="submit" disabled={createEntry.isPending} data-testid="button-save-note">
                    {createEntry.isPending ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5" />
                Life Incident Journal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLifeIncident} className="space-y-4">
                <div>
                  <Label htmlFor="incident-what">What happened?</Label>
                  <Input
                    id="incident-what"
                    name="what"
                    placeholder="Brief description"
                    className="mt-2"
                    data-testid="input-incident-what"
                  />
                </div>
                <div>
                  <Label htmlFor="incident-feeling">How did you feel?</Label>
                  <Textarea
                    id="incident-feeling"
                    name="feeling"
                    placeholder="Before, during, and after..."
                    className="mt-2"
                    data-testid="textarea-incident-feeling"
                  />
                </div>
                <div>
                  <Label htmlFor="incident-resolution">How did you resolve it?</Label>
                  <Textarea
                    id="incident-resolution"
                    name="resolution"
                    placeholder="Lessons learned..."
                    className="mt-2"
                    data-testid="textarea-incident-resolution"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createEntry.isPending} data-testid="button-save-incident">
                  {createEntry.isPending ? "Saving..." : "Save Incident"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5" />
                Car Data Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCarData} className="space-y-4">
                <div>
                  <Label htmlFor="odometer-upload">Odometer Reading *</Label>
                  <Input
                    id="odometer-upload"
                    name="odometer"
                    type="number"
                    placeholder="e.g., 45230"
                    className="mt-2 font-mono"
                    required
                    data-testid="input-odometer-upload"
                  />
                </div>
                <div>
                  <Label htmlFor="fuel-amount-upload">Fuel Amount (L)</Label>
                  <Input
                    id="fuel-amount-upload"
                    name="fuelAmount"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 45.2"
                    className="mt-2 font-mono"
                    data-testid="input-fuel-upload"
                  />
                </div>
                <div>
                  <Label htmlFor="fuel-cost">Fuel Cost (£)</Label>
                  <Input
                    id="fuel-cost"
                    name="fuelCost"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 58.42"
                    className="mt-2 font-mono"
                    data-testid="input-fuel-cost"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createCarData.isPending} data-testid="button-save-car-data">
                  {createCarData.isPending ? "Saving..." : "Save Car Data"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
