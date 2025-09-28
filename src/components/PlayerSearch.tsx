'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getPlayerImageUrl } from '@/lib/utils';

interface Player {
  player_id: string;
  name: string;
}

export function PlayerSearch() {
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

  return (
    <div className="relative w-full max-w-md mx-auto mb-12">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search for NBA players..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#590766] focus:border-transparent outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map((player) => (
              <Link
                key={player.player_id}
                href={`/players/${player.player_id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
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
                <span className="font-medium text-gray-900">{player.name}</span>
              </Link>
            ))
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">No players found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}