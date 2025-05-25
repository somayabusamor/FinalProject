// global.d.ts
declare module 'plotly.js';

declare module 'plotly.js-basic-dist' {
    import { Plotly } from 'plotly.js';
    const plotly: typeof Plotly;
    export default plotly;
  }