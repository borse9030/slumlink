"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import type { Report } from "@/lib/types";
import { generateDevelopmentSuggestions } from "@/ai/flows/generate-development-suggestions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type AiInsightsDialogProps = {
  reports: Report[];
};

type AIResult = {
  summary: string;
  urgentNeeds: string;
  developmentSuggestions: string;
} | null;

export function AiInsightsDialog({ reports }: AiInsightsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult>(null);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Process reports into the format expected by the AI flow
      const zonesDataMap = new Map<string, { [key: string]: number }>();
      reports.forEach(report => {
        if (!zonesDataMap.has(report.zone)) {
          zonesDataMap.set(report.zone, {});
        }
        const zoneData = zonesDataMap.get(report.zone)!;
        zoneData[report.type] = (zoneData[report.type] || 0) + 1;
      });

      const zonesData = Array.from(zonesDataMap.entries()).map(([zone, reportCounts]) => ({
        zone,
        reports: Object.entries(reportCounts).map(([type, count]) => ({ type, count })),
      }));

      // 2. Call the AI flow
      const aiResult = await generateDevelopmentSuggestions({ zonesData });
      setResult(aiResult);

    } catch (e) {
      console.error(e);
      setError("Failed to generate AI insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" onClick={handleGenerateInsights}>
          <Wand2 className="mr-2 h-4 w-4" />
          Get AI Insights
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI-Powered Development Suggestions</DialogTitle>
          <DialogDescription>
            Analysis of infrastructure needs across all zones based on current reports.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4">Analyzing reports...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <div className="space-y-6 text-sm">
                <div>
                    <h3 className="font-semibold font-headline text-lg mb-2">Overall Summary</h3>
                    <p className="text-muted-foreground">{result.summary}</p>
                </div>
                <div>
                    <h3 className="font-semibold font-headline text-lg mb-2">Urgent Needs</h3>
                    <p className="text-muted-foreground">{result.urgentNeeds}</p>
                </div>
                 <div>
                    <h3 className="font-semibold font-headline text-lg mb-2">Development Suggestions</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.developmentSuggestions}</p>
                </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
