import {
  Eye,
  MessageSquare,
  RefreshCw,
  Smartphone,
  TrendingUp,
} from "lucide-react";

interface DashboardStatsProps {
  activeListingsCount: number;
  totalViews: number;
  pendingSwapsCount: number;
  whatsappLeadsCount: number;
}

export function DashboardStats({
  activeListingsCount,
  totalViews,
  pendingSwapsCount,
  whatsappLeadsCount,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Active iPhones",
      value: activeListingsCount,
      change: "+2 this week",
      icon: Smartphone,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Total Impressions",
      value: totalViews,
      change: "Views across devices",
      icon: Eye,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Swap Proposals",
      value: pendingSwapsCount,
      change: "Offers received",
      icon: RefreshCw,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "WhatsApp Leads",
      value: whatsappLeadsCount,
      change: "Direct buyer chats",
      icon: MessageSquare,
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-base-content/70">
                {stat.title}
              </span>
              <div
                className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-base-content/60 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-success shrink-0" />
                <span>{stat.change}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
