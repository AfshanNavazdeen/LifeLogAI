import { UploadCard } from "../upload-card";
import { Camera, FileText } from "lucide-react";

export default function UploadCardExample() {
  return (
    <div className="p-8 grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
      <UploadCard
        icon={Camera}
        title="Upload Receipt"
        description="Snap or upload your receipt"
        acceptTypes="image/*"
        onUpload={(file) => console.log("Receipt uploaded:", file.name)}
      />
      <UploadCard
        icon={FileText}
        title="Document Upload"
        description="Upload any document"
        acceptTypes=".pdf,.doc,.docx,image/*"
        onUpload={(file) => console.log("Document uploaded:", file.name)}
      />
    </div>
  );
}
