"use client";

import { useEffect, useState } from "react";

/** Roughly one viewport of scrolling before the button is worth offering. */
const THRESHOLD = 700;

export function ScrollToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      setVisible(window.scrollY > THRESHOLD);
    };

    // Scroll fires far more often than paint; coalesce to one read per frame.
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    // `scroll-behavior` is not set globally, so the choice is made here — and
    // reduced-motion users get an instant jump instead of a long glide.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label={label}
      title={label}
      // Kept mounted so it can fade, but taken out of the tab order and the
      // accessibility tree while it is invisible.
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-30 grid size-11 place-items-center rounded-full border border-rule bg-surface text-ink-soft shadow-lg shadow-black/5 transition-all hover:border-rule-strong hover:text-saffron ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <svg
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
