"use client";

import React from "react";

// This component is a simple wrapper. Its only job is to provide a consistent
// structure for our GSAP animations to target.
export default function TransitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-transition-wrapper">
      {/* GSAP will animate this div and the elements inside it */}
      {children}
    </div>
  );
}
