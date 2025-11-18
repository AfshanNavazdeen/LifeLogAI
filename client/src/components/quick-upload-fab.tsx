import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, FileText, Heart, Car } from "lucide-react";
import { UploadCard } from "./upload-card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function QuickUploadFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
        onClick={() => setOpen(true)}
        data-testid="button-quick-upload"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Upload</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="receipt" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="receipt" className="gap-1">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Receipt</span>
              </TabsTrigger>
              <TabsTrigger value="note" className="gap-1">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Note</span>
              </TabsTrigger>
              <TabsTrigger value="incident" className="gap-1">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Incident</span>
              </TabsTrigger>
              <TabsTrigger value="car" className="gap-1">
                <Car className="h-4 w-4" />
                <span className="hidden sm:inline">Car</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="receipt" className="space-y-4">
              <UploadCard
                icon={Camera}
                title="Upload Receipt"
                description="Capture or upload receipt image"
                onUpload={(file) => {
                  console.log("Receipt uploaded:", file.name);
                  setOpen(false);
                }}
              />
            </TabsContent>
            <TabsContent value="note" className="space-y-4">
              <div>
                <Label htmlFor="note-text">Quick Note</Label>
                <Textarea
                  id="note-text"
                  placeholder="What's on your mind?"
                  className="min-h-32 mt-2"
                  data-testid="textarea-note"
                />
                <Button className="w-full mt-4" onClick={() => setOpen(false)}>
                  Save Note
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="incident" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="incident-title">What happened?</Label>
                  <Input
                    id="incident-title"
                    placeholder="Brief description"
                    className="mt-2"
                    data-testid="input-incident-title"
                  />
                </div>
                <div>
                  <Label htmlFor="incident-feeling">How did you feel?</Label>
                  <Textarea
                    id="incident-feeling"
                    placeholder="Describe your emotions..."
                    className="mt-2"
                    data-testid="textarea-incident-feeling"
                  />
                </div>
                <Button className="w-full" onClick={() => setOpen(false)}>
                  Save Incident
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="car" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="odometer">Odometer Reading</Label>
                  <Input
                    id="odometer"
                    type="number"
                    placeholder="e.g., 45230"
                    className="mt-2 font-mono"
                    data-testid="input-odometer"
                  />
                </div>
                <div>
                  <Label htmlFor="fuel-amount">Fuel Amount (L)</Label>
                  <Input
                    id="fuel-amount"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 45.2"
                    className="mt-2 font-mono"
                    data-testid="input-fuel-amount"
                  />
                </div>
                <Button className="w-full" onClick={() => setOpen(false)}>
                  Save Car Data
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
