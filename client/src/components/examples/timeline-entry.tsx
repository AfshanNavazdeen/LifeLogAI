import { TimelineEntry } from "../timeline-entry";

export default function TimelineEntryExample() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <TimelineEntry
        id="1"
        category="fuel"
        timestamp={new Date("2024-11-15T14:30:00")}
        title="Shell Station - M4"
        amount={58.42}
        description="Full tank, 45.2L"
        tags={["verified", "auto-categorized"]}
      />
      <TimelineEntry
        id="2"
        category="groceries"
        timestamp={new Date("2024-11-14T18:15:00")}
        title="Tesco Superstore"
        amount={87.23}
        tags={["weekly-shop"]}
      />
      <TimelineEntry
        id="3"
        category="life-event"
        timestamp={new Date("2024-11-13T09:00:00")}
        title="Work presentation went well"
        description="Felt nervous beforehand but received positive feedback. Team appreciated the data analysis section."
        tags={["achievement", "work", "positive"]}
      />
    </div>
  );
}
