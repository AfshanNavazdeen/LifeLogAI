import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, Upload } from "lucide-react";
import { useState } from "react";

interface UploadCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  acceptTypes?: string;
  onUpload?: (file: File) => void;
}

export function UploadCard({
  icon: Icon,
  title,
  description,
  acceptTypes = "image/*",
  onUpload,
}: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && onUpload) {
      onUpload(file);
      console.log("File dropped:", file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
      console.log("File selected:", file.name);
    }
  };

  return (
    <Card
      className={`transition-colors ${
        isDragging ? "border-primary bg-accent/50" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover-elevate">
          <input
            type="file"
            id={`upload-${title.replace(/\s/g, "-")}`}
            accept={acceptTypes}
            onChange={handleFileSelect}
            className="hidden"
            data-testid={`input-upload-${title.toLowerCase().replace(/\s/g, "-")}`}
          />
          <label
            htmlFor={`upload-${title.replace(/\s/g, "-")}`}
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">{description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to browse or drag and drop
              </p>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
