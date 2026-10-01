"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FEATURED, ROWS } from "@/lib/marquee-rows";
import { PauseIcon, PlayIcon } from "./Icons";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function Item({ q }) {
  return (
    <li className="q" lang={q.lang} dir={q.dir}>
      <span className="q-text">{q.display}</span>
      <span className="q-by">{`— ${q.by}`}</span>
    </li>
  );
}

/**
 * Rows drift left → right in every language. Each track holds two identical sets and animates
 * from -50% to 0, so the loop is seamless; duration = measured width / speed.
 */
export default function Marquee({ quotes, labels }) {
  const byId = Object.fromEntries(quotes.map((q) => [q.id, q]));
  const [paused, setPaused] = useState(false);
  const [layout, setLayout] = useState(() => ROWS.map(() => ({ reps: 1, dur: null, delay: null })));
  const setRefs = useRef([]);

  const measure = useCallback(() => {
    setLayout((current) =>
      ROWS.map((row, i) => {
        const set = setRefs.current[i];
        if (!set) return current[i];
        const oneRep = set.scrollWidth / current[i].reps;
        const reps = Math.max(1, Math.ceil((window.innerWidth * 1.2) / Math.max(oneRep, 1)));
        const width = oneRep * reps;
        const dur = width / row.speed;
        return { reps, dur, delay: -dur * row.phase };
      })
    );
  }, []);

  useIsoLayoutEffect(() => {
    measure();
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 150);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready?.then(measure);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
    };
  }, [measure]);

  return (
    <section className={`quotes${paused ? " is-paused" : ""}`} role="region" tabIndex={0} aria-labelledby="quotes-heading">
      <h2 id="quotes-heading" className="sr-only">
        {labels.heading}
      </h2>

      <div className="rows" aria-hidden="true">
        {ROWS.map((row, i) => {
          const items = Array.from({ length: layout[i].reps }, () => row.ids).flat();
          const style = layout[i].dur ? { "--dur": `${layout[i].dur.toFixed(1)}s`, animationDelay: `${layout[i].delay.toFixed(1)}s` } : undefined;
          return (
            <div className="row" data-tier={row.tier} key={i}>
              <div className="track" style={style}>
                {[0, 1].map((copy) => (
                  <ul className="set" key={copy} ref={copy === 0 ? (el) => (setRefs.current[i] = el) : undefined}>
                    {items.map((id, k) => (
                      <Item q={byId[id]} key={`${id}-${k}`} />
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="static-quotes" aria-hidden="true">
        {FEATURED.map((id) => (
          <figure key={id} lang={byId[id].lang}>
            <blockquote>{byId[id].display}</blockquote>
            <figcaption>{`— ${byId[id].by}`}</figcaption>
          </figure>
        ))}
      </div>

      <ul className="sr-only quotes-list">
        {quotes.map((q) => (
          <li key={q.id} lang={q.lang}>{`${q.display} — ${q.by}`}</li>
        ))}
      </ul>

      <button type="button" className="motion-toggle" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        <PauseIcon />
        <PlayIcon />
        <span className="motion-label">{paused ? labels.play : labels.pause}</span>
      </button>
    </section>
  );
}
