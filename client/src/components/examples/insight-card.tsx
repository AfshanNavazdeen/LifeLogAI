import { InsightCard } from "../insight-card";

export default function InsightCardExample() {
  return (
    <div className="p-8 grid gap-4 md:grid-cols-2 max-w-6xl mx-auto">
      <InsightCard
        title="Fuel efficiency improving"
        summary="Your car's fuel efficiency increased by 8% this month compared to last month."
        details="Based on your odometer readings and fuel purchase data, you're now averaging 10.4 km/l compared to 9.6 km/l last month. This improvement could be due to highway driving or recent maintenance."
        severity="success"
      />
      <InsightCard
        title="Spending spike detected"
        summary="Your spending increased by 22% this week."
        details="You typically spend £150/week but this week you've spent £183. The increase is mainly from groceries (£87) and fuel (£58)."
        severity="warning"
      />
      <InsightCard
        title="Similar situation detected"
        summary="This feels similar to your experience on Feb 14, 2024."
        details="You previously handled work stress by taking a break and speaking with a friend. You noted feeling relieved after doing so."
        severity="info"
      />
    </div>
  );
}
