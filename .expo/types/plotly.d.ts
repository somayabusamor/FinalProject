// types/plotly.d.ts
import 'plotly.js';

declare global {
  interface Window {
    Plotly: {
      newPlot: (element: HTMLElement | null, data: Plotly.Data[], layout: Partial<Plotly.Layout>) => void;
      addTraces: (element: HTMLElement | null, trace: Plotly.Data) => void;
      purge: (element: HTMLElement | null) => void;
      Plots: {
        resize: (element: HTMLElement) => void;
      };
    };
  }
}