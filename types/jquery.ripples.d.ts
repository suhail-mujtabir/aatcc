// types/jquery.ripples.d.ts
declare module "jquery" {
    interface JQuery {
      ripples(options?: {
        resolution?: number;
        dropRadius?: number;
        perturbance?: number;
        interactive?: boolean;
        crossOrigin?: string;
      }): JQuery;
  
      ripples(
        method: "destroy" | "pause" | "play" | "drop",
        ...args: any[]
      ): JQuery;
    }
  }
  