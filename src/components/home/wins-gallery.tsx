"use client";

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Marquee } from "@/components/site/marquee";

const COUNT = 11;
const SLIDES = Array.from({ length: COUNT }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

/**
 * The scrolling wall of real wins, with a lightbox.
 *
 * Uses the native <dialog> rather than a custom overlay: showModal() gives
 * focus trapping, Escape-to-close and inertness of the page behind it for free,
 * which a hand-rolled modal usually gets wrong.
 */
export function WinsGallery() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openedByPointer = useRef(false);
  const [index, setIndex] = useState(0);

  function open(i: number, viaPointer: boolean) {
    openedByPointer.current = viaPointer;
    setIndex(i);
    dialogRef.current?.showModal();
  }

  /**
   * Closing a <dialog> restores focus to the element that opened it, and Chrome
   * treats that restored focus as :focus-visible - which left the marquee
   * paused until the next click. If the lightbox was opened with the mouse,
   * drop that focus so the row starts moving again. Keyboard users keep their
   * focus ring, and the pause with it.
   */
  function handleClose() {
    if (!openedByPointer.current) return;
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (active instanceof HTMLElement) active.blur();
    });
  }

  function step(delta: number) {
    setIndex((current) => (current + delta + COUNT) % COUNT);
  }

  return (
    <>
      <Marquee durationSeconds={60} className="mt-8">
        {(copy) =>
          SLIDES.map((slide, i) => (
            <button
              key={slide}
              type="button"
              // event.detail is 0 for keyboard activation, >0 for a real click.
              onClick={(event) => open(i, event.detail > 0)}
              // The clone is on screen for half the loop, so it must stay
              // clickable - but it is aria-hidden, so keep it out of the tab
              // order to avoid a second, silent set of stops.
              tabIndex={copy === "clone" ? -1 : 0}
              aria-label={`Увеличи скрийншот ${i + 1} от ${COUNT}`}
              className="focus-visible:ring-ring/60 mr-4 shrink-0 cursor-zoom-in rounded-xl transition-transform outline-none hover:scale-[1.02] focus-visible:ring-3"
            >
              <Image
                src={`/screenshots/win-${slide}.webp`}
                alt={`Скрийншот с печалба ${i + 1}`}
                width={620}
                height={1378}
                className="border-border h-[22rem] w-auto rounded-xl border object-cover sm:h-[30rem]"
              />
            </button>
          ))
        }
      </Marquee>

      <dialog
        ref={dialogRef}
        // Deliberately no index reset on close: the close event fires
        // asynchronously, so resetting raced with the next thumbnail's click
        // and could open the wrong image. Keeping the last index is better too.
        onClose={handleClose}
        onClick={(event) => {
          // Clicking the backdrop (the dialog itself, not its contents) closes.
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
        aria-label="Преглед на скрийншот"
        className="m-auto max-h-full max-w-full bg-transparent p-0 backdrop:bg-black/80"
      >
        <div className="relative flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Предишен"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronLeftIcon className="size-5" aria-hidden />
          </button>

          <figure className="grid gap-3">
            <Image
              src={`/screenshots/win-${SLIDES[index]}.webp`}
              alt={`Скрийншот с печалба ${index + 1}`}
              width={620}
              height={1378}
              className="max-h-[82vh] w-auto rounded-xl object-contain"
            />
            {/* No visible counter (design feedback); screen readers still
                get their position in the set. */}
            <figcaption className="sr-only">
              Снимка {index + 1} от {COUNT}
            </figcaption>
          </figure>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Следващ"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <ChevronRightIcon className="size-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Затвори"
            className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <XIcon className="size-5" aria-hidden />
          </button>
        </div>
      </dialog>
    </>
  );
}
