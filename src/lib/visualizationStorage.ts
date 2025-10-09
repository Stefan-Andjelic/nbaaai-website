import { GraphConfig } from '@/types/visualizations';

const STORAGE_KEY = 'saved_graphs';

// Get all saved graphs from localStorage
export function getSavedGraphs(): GraphConfig[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading saved graphs:', error);
    return [];
  }
}

// Save a new graph configuration to localStorage
export function saveGraph(config: GraphConfig): void {
  if (typeof window === 'undefined') return;
  
  try {
    const graphs = getSavedGraphs();
    graphs.push(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graphs));
  } catch (error) {
    console.error('Error saving graph:', error);
    throw new Error('Failed to save graph');
  }
}

// Get a single graph by ID
export function getGraphById(id: string): GraphConfig | null {
  const graphs = getSavedGraphs();
  return graphs.find(g => g.id === id) || null;
}

// Delete a graph from localStorage by ID
export function deleteGraph(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const graphs = getSavedGraphs();
    const filtered = graphs.filter(g => g.id !== id);
    
    if (filtered.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error deleting graph:', error);
    throw new Error('Failed to delete graph');
  }
}

// Update an existing graph configuration
export function updateGraph(id: string, updates: Partial<GraphConfig>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const graphs = getSavedGraphs();
    const index = graphs.findIndex(g => g.id === id);
    
    if (index === -1) {
      throw new Error('Graph not found');
    }
    
    graphs[index] = { ...graphs[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graphs));
  } catch (error) {
    console.error('Error updating graph:', error);
    throw new Error('Failed to update graph');
  }
}

// Generate a unique ID for a graph
export function generateGraphId(): string {
  return `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}