"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { glossary, glossaryEntry } from "../lib/glossary";

// Opening one term closes any other open term.
const OPEN_EVENT = "glossary-term-open";
const HOVER_OPEN_DELAY = 250; // ms of resting the mouse on a term before its card opens
const HOVER_CLOSE_DELAY = 150; // ms of grace when moving the mouse from the term onto its card

// How the card was opened: by resting the mouse on the term, by tabbing to it, or by clicking or tapping (stays open).
type Mode = "hover" | "focus" | "pinned";

// A word in the text that shows its definition in a small card, without leaving the page.
// With a mouse: rest on the word to preview it, click to keep it open. On a phone: tap. With a keyboard: Tab to it.
// It is a real link to the glossary entry, so it still works without JavaScript or with ctrl/cmd-click.
export function Term({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  const entry = glossaryEntry(id);
  const cardId = useId();
  const [mode, setMode] = useState<Mode | null>(null);
  const open = mode !== null;
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const link = useRef<HTMLAnchorElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);

  // Place the card under the word, or above it when there is no room below, and keep it inside the screen.
  function place() {
    const word = link.current?.getBoundingClientRect();
    if (!word) return;
    const screen = document.documentElement.clientWidth;
    const width = Math.min(320, screen - 32);
    const left = Math.min(Math.max(16, word.left), screen - 16 - width);
    const height = card.current?.offsetHeight ?? 0;
    const below = word.bottom + 8;
    const top = below + height < window.innerHeight - 8 || word.top - 8 - height < 64 ? below : word.top - 8 - height;
    setPosition({ top: top + window.scrollY, left: left + window.scrollX, width });
  }

  function clearTimers() {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }

  function show(next: Mode) {
    clearTimers();
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: cardId }));
    // A pinned card stays pinned when the mouse comes back over it.
    setMode((current) => (next === "pinned" || current !== "pinned" ? next : current));
  }

  function hide() {
    clearTimers();
    setMode(null);
  }

  // Close a hover preview shortly after the mouse leaves, unless it moves onto the card.
  function scheduleHoverClose() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMode((current) => (current === "hover" ? null : current)), HOVER_CLOSE_DELAY);
  }

  useEffect(() => clearTimers, []);

  useLayoutEffect(() => {
    if (open) place();
    else setPosition(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!card.current?.contains(target) && !link.current?.contains(target)) hide();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Only move focus back to the word if it was inside the card; otherwise focusing the word would reopen it.
        const focusWasInCard = card.current?.contains(document.activeElement);
        hide();
        if (focusWasInCard) link.current?.focus();
      }
    };
    const onOtherOpened = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== cardId) hide();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOtherOpened);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOtherOpened);
      window.removeEventListener("resize", place);
    };
  }, [open, cardId]);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    // Let ctrl/cmd/shift-click and middle-click open the glossary entry like a normal link.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (mode === "pinned") hide();
    else show("pinned");
  }

  // Hover only applies to a real mouse, so phones never get cards from a stray touch.
  function onPointerEnter(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    if (!open) openTimer.current = window.setTimeout(() => show("hover"), HOVER_OPEN_DELAY);
  }

  function onPointerLeave(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(openTimer.current);
    scheduleHoverClose();
  }

  return (
    <>
      <a
        ref={link}
        href={`#glossary-${id}`}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) show("focus");
        }}
        onBlur={() => setMode((current) => (current === "focus" ? null : current))}
        aria-expanded={open}
        aria-controls={open ? cardId : undefined}
        className={`glossary-term ${className}`}
      >
        {children}
      </a>
      {open &&
        createPortal(
          <div
            ref={card}
            id={cardId}
            role="dialog"
            aria-label={entry.term}
            className="glossary-card"
            onPointerEnter={(event) => event.pointerType === "mouse" && window.clearTimeout(closeTimer.current)}
            onPointerLeave={(event) => event.pointerType === "mouse" && scheduleHoverClose()}
            style={{ top: position?.top ?? 0, left: position?.left ?? 0, width: position?.width ?? 320, visibility: position ? "visible" : "hidden" }}
          >
            <p className="font-bold">{entry.term}</p>
            <p className="mt-1">{entry.short}</p>
            <a href={`#glossary-${id}`} onClick={hide} className="mt-2 inline-block font-bold text-[#137cbe] hover:underline">
              Full glossary entry
            </a>
          </div>,
          document.body,
        )}
    </>
  );
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

// The Glossary section at the end of the page, the full reference behind every term.
export function Glossary() {
  return (
    <div>
      <p className="eyebrow text-[#137cbe]">Reference</p>
      <h2 className="display mt-2 max-w-3xl text-4xl leading-[.96] md:text-6xl">Glossary</h2>
      <p className="mt-4 max-w-3xl leading-7 text-slate-700">
        The terms used in this story, in plain words. You can also hover over, click or tap any underlined term on the page to see its
        definition right where you are.
      </p>

      <div className="mt-10 gap-x-12 md:columns-2">
        {glossary.map((group) => (
          <section key={group.title} aria-labelledby={`glossary-group-${slug(group.title)}`} className="mb-10 break-inside-avoid">
            <h3 id={`glossary-group-${slug(group.title)}`} className="border-b border-[#071a2b]/20 pb-2 text-lg font-bold">
              {group.title}
            </h3>
            <dl>
              {group.entries.map((entry) => (
                <div key={entry.id} id={`glossary-${entry.id}`} className="glossary-entry border-b border-[#071a2b]/10 px-2 py-3">
                  <dt className="font-bold">{entry.term}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-700">
                    {entry.short}
                    {entry.long && <> {entry.long}</>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
