'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getPlayerImageUrl } from '@/lib/utils';

interface Player {
  player_id: string;
  name: string;
}

interface PlayerSearchProps {
  onPlayerSelect?: (player: { id: string; name: string }) => void;
  selectedPlayer?: { id: string; name: string } | null;
  showAsLink?: boolean;
}

export function PlayerSearch({ onPlayerSelect, selectedPlayer, showAsLink }: PlayerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchPlayers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.slice(0, 6));
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPlayers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handlePlayerClick = (player: Player) => {
    if (onPlayerSelect) {
      onPlayerSelect({ id: player.player_id, name: player.name });
      setQuery('');
      setIsOpen(false);
    }
  };

  const clearSelection = () => {
    if (onPlayerSelect) {
      onPlayerSelect(null as any);
    }
  };

  // If a player is selected and we're in selection mode, show the selected player
  if (selectedPlayer && onPlayerSelect) {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={getPlayerImageUrl(selectedPlayer.id)}
              alt={`${selectedPlayer.name} headshot`}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100 flex-1">
            {selectedPlayer.name}
          </span>
          <button
            type="button"
            onClick={clearSelection}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search for NBA players..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#590766] focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map((player) => {
              // If showAsLink is true (default), render as Link
              if (showAsLink && !onPlayerSelect) {
                return (
                  <Link
                    key={player.player_id}
                    href={`/players/${player.player_id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={getPlayerImageUrl(player.player_id)}
                        alt={`${player.name} headshot`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{player.name}</span>
                  </Link>
                );
              }

              // Otherwise, render as button for selection
              return (
                <button
                  key={player.player_id}
                  type="button"
                  onClick={() => handlePlayerClick(player)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-left"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={getPlayerImageUrl(player.player_id)}
                      alt={`${player.name} headshot`}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{player.name}</span>
                </button>
              );
            })
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">No players found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}