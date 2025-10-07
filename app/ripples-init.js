import $ from "jquery";

export function initRipples() {
  // Initialize ripple effect on all elements with class 'water'
  $(".water").ripples({
    resolution: 512,
    dropRadius: 20, // ripple radius
    perturbance: 0.04, // distortion intensity
    interactive: true,
  });
}
