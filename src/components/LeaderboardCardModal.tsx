import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface LeaderboardConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  config: {
    topN: number;
    statFilters: Array<{
      stat: string;
      operator: string;
      value: number;
    }>;
  };
}

export function LeaderboardConfigModal({
  isOpen,
  onClose,
  title,
  config,
}: LeaderboardConfigModalProps) {
  // Map stat keys to readable names
  const statDisplayNames: Record<string, string> = {
    pts: "Points",
    trb: "Total Rebounds",
    ast: "Assists",
    stl: "Steals",
    blk: "Blocks",
    fg: "Field Goals Made",
    fga: "Field Goal Attempts",
    fg3: "3-Pointers Made",
    fg3a: "3-Point Attempts",
    ft: "Free Throws Made",
    fta: "Free Throw Attempts",
    tov: "Turnovers",
    pf: "Personal Fouls",
  };

  const operatorDisplayNames: Record<string, string> = {
    ">=": "At least",
    ">": "More than",
    "=": "Exactly",
    "<=": "At most",
    "<": "Less than",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Leaderboard Configuration</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Top N Display */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Top Players
            </h3>
            <p className="text-lg font-medium">Top {config.topN}</p>
          </div>

          {/* Stat Filters Display */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Filters
            </h3>
            <div className="space-y-2">
              {config.statFilters.map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="font-medium">
                    {statDisplayNames[filter.stat] || filter.stat}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {operatorDisplayNames[filter.operator] || filter.operator}{" "}
                    {filter.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
