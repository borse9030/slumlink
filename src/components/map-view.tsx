"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  Pin,
} from "@vis.gl/react-google-maps";
import type { Report } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { Droplets, Lightbulb, School, Trash2, HeartPulse, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const ReportMarker = ({ report, onClick }: { report: Report; onClick: () => void }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const handleMarkerClick = () => {
    onClick();
    setInfoWindowShown((prev) => !prev);
  };
  
  const getIcon = (type: Report['type']) => {
    const props = { className: "w-6 h-6 text-white" };
    switch (type) {
      case "Water": return <Droplets {...props} />;
      case "Electricity": return <Lightbulb {...props} />;
      case "Education": return <School {...props} />;
      case "Sanitation": return <Trash2 {...props} />;
      case "Healthcare": return <HeartPulse {...props} />;
      default: return <MapPin {...props} />;
    }
  }

  const getIconBgColor = (severity: Report['severity']) => {
    switch (severity) {
      case 'High': return 'bg-destructive';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={report.location}
        onClick={handleMarkerClick}
      >
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-lg", getIconBgColor(report.severity))}>
          {getIcon(report.type)}
        </div>
      </AdvancedMarker>
      {infoWindowShown && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setInfoWindowShown(false)}
        >
          <Card className="w-80 border-none shadow-none">
            <CardHeader className="p-2">
              {report.imageUrl && <Image src={report.imageUrl} alt={report.title} width={300} height={150} className="rounded-md object-cover mb-2" data-ai-hint="damaged infrastructure" />}
              <CardTitle className="text-base font-headline">{report.title}</CardTitle>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant={report.severity === 'High' ? 'destructive' : 'secondary'}>{report.severity}</Badge>
                <Badge variant="outline">{report.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-2 text-sm text-muted-foreground">
              <p>{report.description}</p>
            </CardContent>
          </Card>
        </InfoWindow>
      )}
    </>
  );
};


type MapViewProps = {
  reports: Report[];
  selectedReport: Report | null;
  onMarkerClick: (report: Report) => void;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  newReportLocation: { lat: number; lng: number } | null;
};

export function MapView({ reports, selectedReport, onMarkerClick, onMapClick, newReportLocation }: MapViewProps) {
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
  
  const mapCenter = selectedReport ? selectedReport.location : { lat: 19.043, lng: 72.859 };

  return (
    <APIProvider apiKey={MAP_API_KEY}>
      <Map
        center={mapCenter}
        zoom={selectedReport ? 16 : 14}
        mapId="slumlink_map"
        className="w-full h-full"
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        onClick={onMapClick}
      >
        {reports.map((report) => (
          <ReportMarker key={report.id} report={report} onClick={() => onMarkerClick(report)} />
        ))}

        {newReportLocation && (
          <AdvancedMarker position={newReportLocation}>
            <Pin backgroundColor={'hsl(var(--primary))'} borderColor={'hsl(var(--primary-foreground))'} glyphColor={'hsl(var(--primary-foreground))'} />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}
