import { Control, UseFormRegister } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AVAILABLE_STATS, STAT_OPERATORS, LeaderboardFormData } from './types';
import { Controller } from 'react-hook-form';

interface StatFilterRowProps {
  index: number;
  control: Control<LeaderboardFormData>;
  register: UseFormRegister<LeaderboardFormData>;
  onRemove: () => void;
  showRemove: boolean;
}

export function StatFilterRow({
  index,
  control,
  register,
  onRemove,
  showRemove,
}: StatFilterRowProps) {
  return (
    <div className="flex gap-2 items-start">
      {/* Stat Selector */}
      <div className="flex-1">
        <Controller
          name={`statFilters.${index}.stat`}
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select stat" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_STATS.map((stat) => (
                  <SelectItem key={stat.key} value={stat.key}>
                    {stat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Operator Selector */}
      <div className="w-32">
        <Controller
          name={`statFilters.${index}.operator`}
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAT_OPERATORS.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Value Input */}
      <div className="w-24">
        <Input
          type="number"
          step="0.1"
          placeholder="Value"
          {...register(`statFilters.${index}.value`, {
            required: true,
            valueAsNumber: true,
          })}
        />
      </div>

      {/* Remove Button */}
      {showRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}