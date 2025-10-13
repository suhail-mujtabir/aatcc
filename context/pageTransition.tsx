"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Transition, TransitionGroup } from "react-transition-group";
import { gsap } from "gsap";
import TransitionLayout from "@/components/TransitionLayout"; // Import the new layout

export default function Transitions({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nodeRef = React.useRef(null);

  // Animation for when the NEW page enters
  const onEnter = (node: HTMLElement) => {
    if (!node) return;

    // Set initial state: invisible and slightly down
    gsap.set(node, { autoAlpha: 0, y: 50 });

    const timeline = gsap.timeline({ paused: true });
    
    // Animate the main page container in
    timeline.to(node, {
      autoAlpha: 1, // autoAlpha is better than opacity for performance
      y: 0,
      duration: 0.5,
      ease: "power3.out",
    });
    
    // Stagger-animate the individual elements inside the page
    timeline.fromTo(".gsap-reveal",
      { y: 20, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.1, // Animate each element 0.1s after the previous one
      },
      "-=0.3" // Overlap with the main container animation for a smoother effect
    );

    timeline.play();
  };

  // Animation for when the OLD page exits
  const onExit = (node: HTMLElement) => {
    if (!node) return;
    
    gsap.to(node, {
      autoAlpha: 0,
      y: -50, // Slide up
      duration: 0.5,
      ease: "power3.in",
    });
  };

  return (
    <TransitionGroup>
      <Transition
        key={pathname}
        nodeRef={nodeRef}
        timeout={500} // Corresponds to the longest animation duration
        onEnter={onEnter}
        onExit={onExit}
        unmountOnExit
      >
        <div ref={nodeRef}>
          {/* Wrap the children in our new TransitionLayout */}
          <TransitionLayout>{children}</TransitionLayout>
        </div>
      </Transition>
    </TransitionGroup>
  );
}

