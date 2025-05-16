declare interface PlotlyHTMLElement extends HTMLElement {
    on(event: string, callback: (event: any) => void): void;
    removeAllListeners(): void;
  }
  