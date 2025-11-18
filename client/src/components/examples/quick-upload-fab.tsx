import { QuickUploadFAB } from "../quick-upload-fab";

export default function QuickUploadFABExample() {
  return (
    <div className="relative h-screen bg-background">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Quick Upload FAB Demo</h1>
        <p className="text-muted-foreground">
          Click the floating action button in the bottom-right corner to upload data.
        </p>
      </div>
      <QuickUploadFAB />
    </div>
  );
}
