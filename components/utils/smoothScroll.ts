"use client";

// This function handles the smooth scroll logic.
export const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
  e.preventDefault();
  const element = document.getElementById(targetId);
  if (element) {
    window.scrollTo({
      top: element.offsetTop - 80, // Adjust offset for fixed navbar
      behavior: 'smooth',
    });
  }
};
