import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend = "neutral",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <div className="bg-muted p-2 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === "up" && (
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
          )}
          {trend === "down" && (
            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span
            className={
              trend === "up"
                ? "text-green-500"
                : trend === "down"
                ? "text-red-500"
                : ""
            }
          >
            {description}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
