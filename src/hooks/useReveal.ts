import { useEffect } from "react";

/** Adds `in` class to any element with `.rv` when it enters the viewport. */
export const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".rv:not(.in)");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};
