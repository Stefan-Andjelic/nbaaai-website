import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { StatFilterRow } from "./StatFilterRow";
import { LeaderboardFormData, StatFilter } from "./types";
import { useState } from "react";

interface LeaderboardFormProps {
  onClose: () => void;
  onSuccess?: (leaderboard: any) => void; // Add callback prop
}

export function LeaderboardForm({ onClose, onSuccess }: LeaderboardFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaderboardFormData>({
    defaultValues: {
      topN: 5,
      title: "",
      statFilters: [{ stat: "pts", operator: ">=", value: 30 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "statFilters",
  });

  const onSubmit = async (data: LeaderboardFormData) => {
    setIsSubmitting(true);

    try {
      // Call API endpoint
      const response = await fetch("/api/leaderboards/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create leaderboard");
      }

      const result = await response.json();

      console.log("Leaderboard created successfully:", result);

      // IMPORTANT: Call the callback with API response
      if (onSuccess) {
        onSuccess(result); // This triggers handleLeaderboardCreated in the page
      }

      // Option 1: Pass results back to parent component
      // onSuccess?.(result);

      // Option 2: Store in local state/context and display
      // addCustomLeaderboard(result);

      // Option 3: Navigate to results page
      // router.push(`/ethical-leaderboards/${result.id}`);

      onClose();
    } catch (error) {
      console.error("Error creating leaderboard:", error);
      alert("Failed to create leaderboard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStatFilter = () => {
    append({ stat: "pts", operator: ">=", value: 10 });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Top N Players - Fixed at 5 */}
      <div className="space-y-2">
        <Label htmlFor="topN">Top Players</Label>
        <Input
          id="topN"
          type="number"
          value={5}
          disabled
          className="bg-gray-100 dark:bg-gray-800"
        />
        <p className="text-sm text-muted-foreground">
          Currently limited to top 5 players
        </p>
      </div>

      {/* Leaderboard Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Leaderboard Title</Label>
        <Input
          id="title"
          placeholder="e.g., 30-Point Triple-Double (No FTs)"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Stat Filters Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Stat Filters</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStatFilter}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Filter
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field: any, index: number) => (
            <StatFilterRow
              key={field.id}
              index={index}
              control={control}
              register={register}
              onRemove={() => remove(index)}
              showRemove={fields.length > 1}
            />
          ))}
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add at least one stat filter to create a leaderboard
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || fields.length === 0}>
          {isSubmitting ? "Creating..." : "Create Leaderboard"}
        </Button>
      </div>
    </form>
  );
}
