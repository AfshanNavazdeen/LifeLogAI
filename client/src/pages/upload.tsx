import { UploadCard } from "@/components/upload-card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, FileText, Heart, Car, Mic } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Upload() {
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceNote = () => {
    setIsRecording(!isRecording);
    console.log(isRecording ? "Stopped recording" : "Started recording");
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Upload Data</h1>
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
          onUpload={(file) => console.log("Receipt uploaded:", file.name)}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Quick Text Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-32"
              data-testid="textarea-quick-note"
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceNote}
                data-testid="button-voice-note"
                className={isRecording ? "bg-destructive text-destructive-foreground" : ""}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button data-testid="button-save-note">Save Note</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5" />
              Life Incident Journal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="incident-what">What happened?</Label>
              <Input
                id="incident-what"
                placeholder="Brief description"
                className="mt-2"
                data-testid="input-incident-what"
              />
            </div>
            <div>
              <Label htmlFor="incident-feeling">How did you feel?</Label>
              <Textarea
                id="incident-feeling"
                placeholder="Before, during, and after..."
                className="mt-2"
                data-testid="textarea-incident-feeling"
              />
            </div>
            <div>
              <Label htmlFor="incident-resolution">How did you resolve it?</Label>
              <Textarea
                id="incident-resolution"
                placeholder="Lessons learned..."
                className="mt-2"
                data-testid="textarea-incident-resolution"
              />
            </div>
            <Button className="w-full" data-testid="button-save-incident">Save Incident</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5" />
              Car Data Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="odometer-upload">Odometer Reading</Label>
              <Input
                id="odometer-upload"
                type="number"
                placeholder="e.g., 45230"
                className="mt-2 font-mono"
                data-testid="input-odometer-upload"
              />
            </div>
            <div>
              <Label htmlFor="fuel-amount-upload">Fuel Amount (L)</Label>
              <Input
                id="fuel-amount-upload"
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
                type="number"
                step="0.01"
                placeholder="e.g., 58.42"
                className="mt-2 font-mono"
                data-testid="input-fuel-cost"
              />
            </div>
            <Button className="w-full" data-testid="button-save-car-data">Save Car Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
