"use client";

import { useEffect, useState, useRef } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Search } from 'lucide-react';

export function PlacesAutocomplete({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.AutocompletePrediction | null) => void }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { /* Define search scope here */ },
    debounce: 300,
  });
  const ref = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelect = (place: google.maps.places.AutocompletePrediction) => () => {
    setValue(place.description, false);
    clearSuggestions();
    onPlaceSelect(place);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
            clearSuggestions();
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clearSuggestions]);


  const renderSuggestions = () => {
    return data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <div
          key={place_id}
          onClick={handleSelect(suggestion)}
          className="p-2 hover:bg-muted cursor-pointer text-sm"
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </div>
      );
    });
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Search for a location..."
          className="w-full pl-9"
          type="text"
        />
      </div>
      {status === "OK" && (
        <Card className="absolute top-full mt-1 w-full bg-card border rounded-md shadow-lg z-20">
          {renderSuggestions()}
        </Card>
      )}
    </div>
  );
}
