declare global {
  interface Window {
    Plotly: {
      newPlot: (element: HTMLElement | null, data: Plotly.Data[], layout: Partial<Plotly.Layout>) => void;
      addTraces: (element: HTMLElement | null, trace: Plotly.Data) => void;
      purge: (element: HTMLElement | null) => void;
      relayout: (element: HTMLElement | null, layout: Partial<Plotly.Layout>) => void;
      react: (element: HTMLElement | null, data: Plotly.Data[], layout: Partial<Plotly.Layout>) => void;
      Plots: {
        resize: (element: HTMLElement) => void;
      };
    };
  }
}
