"use client";

import { useState, useEffect } from "react";
import { GraphConfigForm } from "@/components/visualizations/GraphConfigForm";
import { GraphDisplay } from "@/components/visualizations/GraphDisplay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, TrendingUp, Trash2 } from "lucide-react";
import {
  StatMetric,
  ContextType,
  AggregationType,
  GraphConfig,
  GraphAPIResponse,
  STAT_ABBREVIATIONS,
} from "@/types/visualizations";
import {
  getSavedGraphs,
  saveGraph,
  generateGraphId,
  deleteGraph,
} from "@/lib/visualizationStorage";

export default function VisualizationsPage() {
  const [graphData, setGraphData] = useState<GraphAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedGraphs, setSavedGraphs] = useState<GraphConfig[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [graphName, setGraphName] = useState("");
  const [currentConfig, setCurrentConfig] = useState<{
    playerIds: string[];
    metric: StatMetric;
    seasonStart: number;
    seasonEnd: number;
    context: ContextType;
    aggregation?: AggregationType;
  } | null>(null);

  // Load saved graphs on mount
  useEffect(() => {
    const graphs = getSavedGraphs();
    setSavedGraphs(graphs);
  }, []);

  // Sync saved graphs to localStorage
  useEffect(() => {
    if (savedGraphs.length > 0) {
      localStorage.setItem("saved_graphs", JSON.stringify(savedGraphs));
    } else {
      localStorage.removeItem("saved_graphs");
    }
  }, [savedGraphs]);

  const handleGenerateGraph = async (config: {
    playerIds: string[];
    metric: StatMetric;
    seasonStart: number;
    seasonEnd: number;
    context: ContextType;
    aggregation?: AggregationType;
  }) => {
    setIsLoading(true);
    setCurrentConfig(config);

    try {
      console.log(`Generating graph with config:`, config);
      const response = await fetch("/api/visualizations/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch graph data");
      }

      const data: GraphAPIResponse = await response.json();
      setGraphData(data);
    } catch (error) {
      console.error("Error generating graph:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate graph. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGraph = () => {
    if (!currentConfig || !graphData) {
      alert("Please generate a graph first");
      return;
    }

    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!graphName.trim()) {
      alert("Please enter a name for the graph");
      return;
    }

    if (!currentConfig) return;

    const newGraph: GraphConfig = {
      id: generateGraphId(),
      name: graphName.trim(),
      playerIds: currentConfig.playerIds,
      metric: currentConfig.metric,
      seasonStart: currentConfig.seasonStart,
      seasonEnd: currentConfig.seasonEnd,
      context: currentConfig.context,
      aggregation: currentConfig.aggregation || "per_game",
      createdAt: Date.now(),
    };

    try {
      saveGraph(newGraph);
      setSavedGraphs((prev) => [...prev, newGraph]);
      setGraphName("");
      setIsSaveModalOpen(false);
      alert("Graph saved successfully!");
    } catch (error) {
      console.error("Error saving graph:", error);
      alert("Failed to save graph. Please try again.");
    }
  };

  const handleDeleteGraph = (graphId: string) => {
    if (!confirm("Are you sure you want to delete this saved graph?")) {
      return;
    }

    try {
      deleteGraph(graphId);
      setSavedGraphs((prev) => prev.filter((g) => g.id !== graphId));
    } catch (error) {
      console.error("Error deleting graph:", error);
      alert("Failed to delete graph. Please try again.");
    }
  };

  const handleLoadGraph = async (graph: GraphConfig) => {
    await handleGenerateGraph({
      playerIds: graph.playerIds,
      metric: graph.metric,
      seasonStart: graph.seasonStart,
      seasonEnd: graph.seasonEnd,
      context: graph.context,
      aggregation: graph.aggregation,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getContextLabel = (context: ContextType) => {
    const labels: Record<ContextType, string> = {
      regular: "Regular Season",
      playoffs: "Playoffs",
      all: "All Games",
    };
    return labels[context];
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Player Statistics Visualization
        </h1>
        <p className="text-muted-foreground">
          Compare player performance across seasons with interactive graphs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configure Graph</CardTitle>
              <CardDescription>
                Select players and parameters to visualize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GraphConfigForm
                onGenerate={handleGenerateGraph}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Graph Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Graph Display */}
          {isLoading ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
                  <p className="text-muted-foreground">Generating graph...</p>
                </div>
              </CardContent>
            </Card>
          ) : graphData ? (
            <div className="space-y-4">
              <GraphDisplay
                data={graphData.data}
                players={graphData.players}
                metric={graphData.metric}
                aggregation={currentConfig?.aggregation || "per_game"}
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveGraph} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Graph
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No graph generated yet</p>
                  <p className="text-sm mt-2">
                    Configure your graph parameters and click "Generate Graph"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Graphs Section */}
          {savedGraphs.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Saved Graphs</h2>
              <div className="grid grid-cols-1 gap-4">
                {savedGraphs.map((graph) => (
                  <Card key={graph.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {graph.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {STAT_ABBREVIATIONS[graph.aggregation][graph.metric]} •{" "}
                            {graph.seasonStart}-{graph.seasonEnd} •{" "}
                            {getContextLabel(graph.context)} •{" "}
                            {graph.playerIds.length} player
                            {graph.playerIds.length !== 1 ? "s" : ""}
                          </CardDescription>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created {formatDate(graph.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadGraph(graph)}
                          >
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleDeleteGraph(graph.id)}
                            title="Delete graph"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Graph Modal */}
      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Graph</DialogTitle>
            <DialogDescription>
              Give your graph a name so you can easily find it later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="graphName">Graph Name</Label>
              <Input
                id="graphName"
                placeholder="e.g., LeBron vs Durant PPG Comparison"
                value={graphName}
                onChange={(e) => setGraphName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmSave();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSaveModalOpen(false);
                setGraphName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
