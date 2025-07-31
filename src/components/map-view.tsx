"use client";

import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import type { Report } from "@/lib/types";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { Droplets, Lightbulb, School, Trash2, HeartPulse, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onMapClick: (lat: number, lng: number) => void;
  newReportLocation: { lat: number; lng: number } | null;
  center: { lat: number; lng: number };
  zoom: number;
  onCenterChanged: (center: { lat: number; lng: number }) => void;
  onZoomChanged: (zoom: number) => void;
};

export function MapView({ 
  reports, 
  selectedReport, 
  onMarkerClick, 
  onMapClick,
  newReportLocation,
  center,
  zoom,
  onCenterChanged,
  onZoomChanged,
}: MapViewProps) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
        }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, onMapClick]);
  
  return (
    <Map
      center={center}
      zoom={zoom}
      mapId="slumlink_map"
      className="w-full h-full"
      gestureHandling={'greedy'}
      disableDefaultUI={false}
      onCenterChanged={(e) => onCenterChanged(e.detail.center)}
      onZoomChanged={(e) => onZoomChanged(e.detail.zoom)}
    >
      {reports.map((report) => (
        <ReportMarker key={report.id} report={report} onClick={() => onMarkerClick(report)} />
      ))}

      {newReportLocation && (
        <AdvancedMarker position={newReportLocation}>
          <Pin background={'hsl(var(--primary))'} borderColor={'hsl(var(--primary-foreground))'} glyphColor={'hsl(var(--primary-foreground))'} />
        </AdvancedMarker>
      )}
    </Map>
  );
}
