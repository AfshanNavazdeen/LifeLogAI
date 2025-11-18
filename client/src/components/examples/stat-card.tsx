import { StatCard } from "../stat-card";
import { DollarSign, Fuel, TrendingUp } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-8 grid gap-4 md:grid-cols-3">
      <StatCard
        icon={DollarSign}
        label="Total Spending"
        value="£1,847"
        change="12%"
        trend="up"
      />
      <StatCard
        icon={Fuel}
        label="Fuel This Month"
        value="£182"
        change="5%"
        trend="down"
      />
      <StatCard
        icon={TrendingUp}
        label="Entries"
        value="47"
        change="23%"
        trend="up"
      />
    </div>
  );
}
