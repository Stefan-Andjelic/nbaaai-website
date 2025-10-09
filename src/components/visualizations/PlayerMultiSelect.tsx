"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { getPlayerImageUrl } from "@/lib/utils";

interface Player {
  player_id: string;
  name: string;
}

interface PlayerMultiSelectProps {
  selectedPlayers: Player[];
  onPlayersChange: (players: Player[]) => void;
  maxPlayers?: number;
}

export function PlayerMultiSelect({
  selectedPlayers,
  onPlayersChange,
  maxPlayers = 8,
}: PlayerMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/players/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter out already selected players
        const filtered = data.filter(
          (p: Player) => !selectedPlayers.some((sp) => sp.player_id === p.player_id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error("Error searching players:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddPlayer = (player: Player) => {
    if (selectedPlayers.length >= maxPlayers) {
      alert(`Maximum ${maxPlayers} players allowed`);
      return;
    }

    onPlayersChange([...selectedPlayers, player]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemovePlayer = (playerId: string) => {
    onPlayersChange(selectedPlayers.filter((p) => p.player_id !== playerId));
  };

  return (
    <div className="space-y-4">
      {/* Selected Players */}
      {selectedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map((player) => (
            <div
              key={player.player_id}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full"
            >
              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={getPlayerImageUrl(player.player_id)}
                  alt={player.name}
                  fill
                  className="object-cover"
                  sizes="24px"
                  unoptimized
                />
              </div>
              <span className="text-sm font-medium">{player.name}</span>
              <button
                onClick={() => handleRemovePlayer(player.player_id)}
                className="hover:text-destructive"
                aria-label={`Remove ${player.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder={`Search players... (${selectedPlayers.length}/${maxPlayers} selected)`}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={selectedPlayers.length >= maxPlayers}
        />

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((player) => (
              <button
                key={player.player_id}
                onClick={() => handleAddPlayer(player)}
                className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
              >
                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={getPlayerImageUrl(player.player_id)}
                    alt={player.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                </div>
                <span className="font-medium">{player.name}</span>
              </button>
            ))}
          </div>
        )}

        {isSearching && searchQuery && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg p-3 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Select {maxPlayers - selectedPlayers.length} more player
        {maxPlayers - selectedPlayers.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}