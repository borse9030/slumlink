"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { MapPin, Loader2 } from "lucide-react";
import { addReport } from "@/lib/report-service";
import type { ReportSeverity, ReportType } from "@/lib/types";
import { useUser } from "@/hooks/useUser";

type ReportDialogProps = {
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  location: { lat: number; lng: number } | null;
  onReportSubmit: () => void;
};

export function ReportDialog({ children, onOpenChange, open, location, onReportSubmit }: ReportDialogProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [lat, setLat] = React.useState('');
  const [lng, setLng] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [type, setType] = React.useState<ReportType | ''>('');
  const [severity, setSeverity] = React.useState<ReportSeverity | ''>('');


  useEffect(() => {
    if (location) {
      setLat(location.lat.toFixed(6));
      setLng(location.lng.toFixed(6));
    }
  }, [location]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!location) {
        toast({
            variant: "destructive",
            title: "Location Missing",
            description: "Please select a location on the map before submitting.",
        });
        return;
    }
    if (!type || !severity) {
      toast({
          variant: "destructive",
          title: "Missing Fields",
          description: "Please select a category and severity.",
      });
      return;
    }
    
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to submit a report.",
        });
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const reportData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        type: type,
        severity: severity,
        location: location,
        zone: 'Dharavi-Mumbai', // This should probably be dynamic
        user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl }
    };

    try {
        await addReport(reportData);
        toast({
          title: "Report Submitted",
          description: "Thank you for your contribution.",
        });
        onReportSubmit(); // Callback to refresh the reports list
        onOpenChange(false);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: "Could not submit the report. Please try again.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Submit New Report</DialogTitle>
          <DialogDescription>
            Help improve community infrastructure. Double-right-click on the map to pin a location.
          </DialogDescription>
        </DialogHeader>
        {!location && open && (
            <Alert>
                <MapPin className="h-4 w-4" />
                <AlertTitle>Select a Location</AlertTitle>
                <AlertDescription>
                    Please double-right-click on the map to specify the exact location of the issue.
                </AlertDescription>
            </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" name="title" placeholder="e.g., Broken streetlight" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Category
              </Label>
              <Select name="type" required value={type} onValueChange={(value) => setType(value as ReportType)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Water">Water</SelectItem>
                  <SelectItem value="Electricity">Electricity</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Sanitation">Sanitation</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="severity" className="text-right">
                Severity
              </Label>
              <Select name="severity" required value={severity} onValueChange={(value) => setSeverity(value as ReportSeverity)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a severity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the issue in detail..."
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo" className="text-right">
                Photo
              </Label>
              <Input id="photo" name="photo" type="file" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                    Location
                </Label>
                <Input 
                  id="location" 
                  value={location ? `${lat}, ${lng}` : "Select on map"} 
                  className="col-span-3" 
                  readOnly
                  required
                />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !user}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
