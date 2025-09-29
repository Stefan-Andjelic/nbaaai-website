"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateLeaderboardModal } from './CreateLeaderboardModal';

interface CreateLeaderboardButtonProps {
  onSuccess?: (leaderboard: any) => void; // Add callback prop
}

export function CreateLeaderboardButton({ onSuccess }: CreateLeaderboardButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Custom Leaderboard
      </Button>

      <CreateLeaderboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onSuccess} // Pass callback to modal
      />
    </>
  );
}