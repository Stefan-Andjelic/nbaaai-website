import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LeaderboardForm } from './LeaderboardForm';

interface CreateLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (leaderboard: any) => void; // Add callback prop
}

export function CreateLeaderboardModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateLeaderboardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Leaderboard</DialogTitle>
          <DialogDescription>
            Set filters to find players with specific game achievements
          </DialogDescription>
        </DialogHeader>

        <LeaderboardForm onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}