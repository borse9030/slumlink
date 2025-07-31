"use client";

import * as React from "react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
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
import { AiInsightsDialog } from "./ai-insights-dialog";
import type { Report, ReportStatus } from "@/lib/types";
import { mockReports } from "@/lib/data";
import { Download, Filter, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { useUser } from "@/hooks/useUser";

const PlacesAutocomplete = dynamic(() => import('./places-autocomplete').then(mod => mod.PlacesAutocomplete), {
  ssr: false,
});

const MapView = dynamic(() => import('./map-view').then(mod => mod.MapView), {
  ssr: false,
});


function GovernmentDashboardContent() {
  const [reports, setReports] = React.useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();

  const [mapCenter, setMapCenter] = React.useState({ lat: 19.043, lng: 72.859 });
  const [mapZoom, setMapZoom] = React.useState(12);

  const [ngoFilter, setNgoFilter] = React.useState<string>("all");
  const [zoneFilter, setZoneFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<ReportStatus | "all">("all");
  
  const placesLib = useMapsLibrary('places');

  const filteredReports = reports.filter(report => {
    return (
      (zoneFilter === 'all' || report.zone === zoneFilter) &&
      (statusFilter === 'all' || report.status === statusFilter) &&
      (ngoFilter === 'all' || report.user.name.includes(ngoFilter)) // Simple mock filter
    );
  });
  
  const allZones = [...new Set(mockReports.map(r => r.zone))];
  const allNgos = [...new Set(mockReports.map(r => r.user.name.split(' ')[0]))]; // Mock NGO names


  const handleCardClick = (report: Report) => {
    setSelectedReport(report);
    setMapCenter(report.location);
    setMapZoom(16);
  };
  
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
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {allZones.map(zone => <SelectItem key={zone} value={zone}>{zone}</SelectItem>)}
                  </SelectContent>
                </Select>
                 <Select value={ngoFilter} onValueChange={setNgoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by NGO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All NGOs</SelectItem>
                     {allNgos.map(ngo => <SelectItem key={ngo} value={ngo}>{ngo}</SelectItem>)}
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
              <SidebarGroupLabel>All Reports ({filteredReports.length})</SidebarGroupLabel>
              <ScrollArea className="h-[calc(100vh-350px)]">
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
                Government Dashboard
              </h2>
            </div>
            <div className="flex-1 max-w-sm mx-auto">
              {placesLib && <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />}
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
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
              onMapClick={() => {}} // Gov users don't create reports by clicking
              newReportLocation={null} // No new report pin
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


export function GovernmentDashboard() {
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
            <GovernmentDashboardContent />
        </APIProvider>
    )
}
