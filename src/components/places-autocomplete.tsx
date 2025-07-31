"use client";

import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

type PlacesAutocompleteProps = {
    onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
};

export function PlacesAutocomplete({ onPlaceSelect }: PlacesAutocompleteProps) {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const places = useMapsLibrary("places");
    const geocoding = useMapsLibrary("geocoding");
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const geocoder = useRef<google.maps.Geocoder | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (places) {
            autocompleteService.current = new places.AutocompleteService();
        }
        if (geocoding) {
            geocoder.current = new geocoding.Geocoder();
        }
    }, [places, geocoding]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
        if (value && autocompleteService.current) {
            autocompleteService.current.getPlacePredictions(
                { input: value },
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        setSuggestions(predictions || []);
                    } else {
                        setSuggestions([]);
                    }
                }
            );
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (prediction: google.maps.places.AutocompletePrediction) => {
        setInputValue(prediction.description);
        setSuggestions([]);
        if (geocoder.current && prediction.place_id) {
            geocoder.current.geocode({ placeId: prediction.place_id }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                    onPlaceSelect(results[0]);
                }
            });
        }
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <Input
                type="text"
                placeholder="Search for a location..."
                value={inputValue}
                onChange={handleInputChange}
                className="w-full"
            />
            {suggestions.length > 0 && (
                <Card className="absolute top-full mt-1 w-full bg-card border rounded-md shadow-lg z-20">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.place_id}
                            className="p-2 hover:bg-muted cursor-pointer text-sm"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.description}
                        </div>
                    ))}
                </Card>
            )}
        </div>
    );
}
