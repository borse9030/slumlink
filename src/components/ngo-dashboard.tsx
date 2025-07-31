"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ReportCard } from "./report-card";
import { ReportDialog } from "./report-dialog";
import { AiInsightsDialog } from "./ai-insights-dialog";
import type { Report, ReportSeverity, ReportStatus, ReportType } from "@/lib/types";
import { Filter, LogOut, PlusCircle, Settings, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { useUser } from "@/hooks/useUser";
import { getReports, addReport } from "@/lib/report-service";
import { Skeleton } from "./ui/skeleton";

const PlacesAutocomplete = dynamic(() => import('./places-autocomplete').then(mod => mod.PlacesAutocomplete), {
  ssr: false,
});

const MapView = dynamic(() => import('./map-view').then(mod => mod.MapView), {
  ssr: false,
});

function NgoDashboardContent() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = React.useState(true);
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [isReportDialogOpen, setReportDialogOpen] = React.useState(false);
  
  const [newReportLocation, setNewReportLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();

  const [mapCenter, setMapCenter] = React.useState({ lat: 19.043, lng: 72.859 });
  const [mapZoom, setMapZoom] = React.useState(14);

  const [typeFilter, setTypeFilter] = React.useState<ReportType | "all">("all");
  const [severityFilter, setSeverityFilter] = React.useState<ReportSeverity | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<ReportStatus | "all">("all");
  
  const placesLib = useMapsLibrary('places');

  const fetchReports = React.useCallback(async () => {
    setIsLoadingReports(true);
    const reportsFromDb = await getReports();
    setReports(reportsFromDb);
    setIsLoadingReports(false);
  }, []);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reports.filter(report => {
    return (
      (typeFilter === 'all' || report.type === typeFilter) &&
      (severityFilter === 'all' || report.severity === severityFilter) &&
      (statusFilter === 'all' || report.status === statusFilter)
    );
  });

  const handleCardClick = (report: Report) => {
    setSelectedReport(report);
    setNewReportLocation(null); 
    if(report.location) {
      setMapCenter(report.location);
      setMapZoom(16);
    }
  };

  const handleDoubleRightClick = (lat: number, lng: number) => {
    setNewReportLocation({ lat, lng });
    setReportDialogOpen(true);
    toast({
        title: "Location Pinned",
        description: "A new report has been started at the selected location.",
    });
  };
  
  const handleNewReportClick = () => {
    setSelectedReport(null);
    setNewReportLocation(null); // Clear any previous location
    setReportDialogOpen(true);
    toast({
        title: "Click on the Map",
        description: "Double-right-click anywhere on the map to set a location for your new report.",
    });
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedReport(null);
      setNewReportLocation(null); 
    }
    setReportDialogOpen(open);
  }

  const handlePlaceSelect = async (place: google.maps.places.AutocompletePrediction | null) => {
    if (!place) return;

    try {
      const results = await getGeocode({ placeId: place.place_id });
      const { lat, lng } = getLatLng(results[0]);
      setMapCenter({ lat, lng });
      setMapZoom(16);
    } catch (error) {
      console.error("Error getting geocode: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch location data. Please try again."
      });
    }
  };

  const handleLogout = () => {
    // In a real app, this would also clear auth tokens/session
    router.push('/login');
  };

  const handleReportSubmit = async () => {
    await fetchReports();
  };
  
  return (
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-8 w-8 text-primary fill-current"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <h1 className="text-xl font-semibold font-headline">SlumLink</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2"><Filter size={16}/> Filters</SidebarGroupLabel>
              <div className="space-y-3 p-2">
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Water">Water</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Sanitation">Sanitation</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SidebarGroup>
            <Separator />
            <SidebarGroup className="flex-1">
              <SidebarGroupLabel>Reports ({filteredReports.length})</SidebarGroupLabel>
              <ScrollArea className="h-[calc(100vh-350px)]">
                 {isLoadingReports ? (
                   <div className="space-y-2 p-2">
                     <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-24 w-full" />
                     <Skeleton className="h-24 w-full" />
                   </div>
                 ) : (
                    <div className="space-y-2 p-2">
                      {filteredReports.map((report) => (
                        <ReportCard
                          key={report.id}
                          report={report}
                          isSelected={selectedReport?.id === report.id}
                          onClick={() => handleCardClick(report)}
                        />
                      ))}
                    </div>
                 )}
              </ScrollArea>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <AiInsightsDialog reports={reports} />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex items-center justify-between p-4 border-b gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold font-headline hidden sm:block">
                NGO Dashboard
              </h2>
            </div>
            <div className="flex-1 max-w-sm mx-auto">
              {placesLib && <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />}
            </div>
            <div className="flex items-center gap-4">
              <ReportDialog
                  open={isReportDialogOpen}
                  onOpenChange={handleDialogClose}
                  location={newReportLocation}
                  onReportSubmit={handleReportSubmit}
              >
                  <Button onClick={handleNewReportClick}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Report
                  </Button>
              </ReportDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><UserIcon className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                  <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 relative">
            <MapView 
              reports={filteredReports} 
              selectedReport={selectedReport} 
              onMarkerClick={handleCardClick}
              onMapClick={handleDoubleRightClick}
              newReportLocation={newReportLocation}
              center={mapCenter}
              zoom={mapZoom}
              onCenterChanged={setMapCenter}
              onZoomChanged={setMapZoom}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}


export function NgoDashboard() {
    const MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!MAP_API_KEY) {
        return (
          <div className="flex items-center justify-center h-full bg-muted">
            <div className="text-center p-4 rounded-lg bg-card border">
                <h2 className="text-xl font-bold">Map Unavailable</h2>
                <p className="text-muted-foreground">Google Maps API key is missing.</p>
            </div>
          </div>
        );
      }

    return (
        <APIProvider apiKey={MAP_API_KEY} libraries={['places']}>
            <NgoDashboardContent />
        </APIProvider>
    )
}
