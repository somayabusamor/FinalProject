declare namespace Plotly {
    interface PlotlyHTMLElement extends HTMLElement {
      data: any[];
      layout: any;
      config: any;
      frames: any[];
      on: (event: string, callback: () => void) => void;
    }
  }
  