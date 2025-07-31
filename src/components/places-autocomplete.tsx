"use client";

import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Search } from "lucide-react";

type PlacesAutocompleteProps = {
    onPlaceSelect: (place: google.maps.places.AutocompletePrediction) => void;
};

export function PlacesAutocomplete({ onPlaceSelect }: PlacesAutocompleteProps) {
    const placesLib = useMapsLibrary('places');
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (placesLib) {
            autocompleteService.current = new placesLib.AutocompleteService();
        }
    }, [placesLib]);
    
    useEffect(() => {
        if (!placesLib || !autocompleteService.current || !inputValue) {
            setSuggestions([]);
            return;
        }

        const request = {
            input: inputValue,
        };

        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                setSuggestions(predictions);
            } else {
                setSuggestions([]);
            }
        });
    }, [inputValue, placesLib]);


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

    const handleSuggestionClick = (prediction: google.maps.places.AutocompletePrediction) => {
        setInputValue(prediction.description);
        setSuggestions([]);
        onPlaceSelect(prediction);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search for a location..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full pl-9"
                />
            </div>

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
