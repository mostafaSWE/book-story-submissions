"use client";

import { useParams } from "next/navigation";
import { Nib } from "@/components/Icons";
import ar from "@messages/ar.json";
import en from "@messages/en.json";

const COPY = { ar, en };

export default function NotFound() {
  const { lang } = useParams() || {};
  const m = COPY[lang] || ar;
  const home = `/${COPY[lang] ? lang : "ar"}`;
  return (
    <main id="main" className="thanks" style={{ paddingBlockStart: "12vh" }}>
      <Nib className="nib nib-large" />
      <h1 className="thanks-title">{m.notFoundTitle}</h1>
      <p className="thanks-body">{m.notFoundBody}</p>
      <a className="button button-primary" href={home}>{m.home}</a>
    </main>
  );
}
