"use client";

import { BackIcon } from "./Icons";

/** "Back": returns to the previous page on this site if there is one (keeps the form draft), else goes home. */
export default function BackLink({ href, label }) {
  return (
    <a
      className="back-link"
      href={href}
      onClick={(event) => {
        const sameSite = document.referrer && new URL(document.referrer).origin === location.origin;
        if (sameSite && history.length > 1) {
          event.preventDefault();
          history.back();
        }
      }}
    >
      <BackIcon />
      <span>{label}</span>
    </a>
  );
}
