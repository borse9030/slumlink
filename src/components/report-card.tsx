"use client"

import type { Report } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type ReportCardProps = {
  report: Report;
  isSelected: boolean;
  onClick: () => void;
};

export function ReportCard({ report, isSelected, onClick }: ReportCardProps) {
  const getSeverityColor = (severity: Report['severity']) => {
    switch (severity) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
    }
  };

  return (
    <Card
      className={cn(
        "cursor-pointer hover:bg-muted/80 transition-colors",
        isSelected && "bg-muted ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3">
        <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-semibold leading-tight pr-2">{report.title}</CardTitle>
            <div className={cn("w-3 h-3 rounded-full flex-shrink-0 mt-1", getSeverityColor(report.severity))} />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{report.type}</Badge>
            <Badge variant="outline">{report.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
