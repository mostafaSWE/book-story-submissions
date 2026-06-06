"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import FlagIcon from "@/components/FlagIcon";
import { languages } from "@/lib/i18n";

export default function LanguageSelect({
  value,
  onChange,
  labels,
  dir = "ltr",
  compact = false,
  searchable = true
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const selected = languages.find((language) => language.code === value) || null;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredLanguages = useMemo(() => {
    if (!normalizedQuery) return languages;
    return languages.filter((language) =>
      `${language.name} ${language.code}`.toLocaleLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (open && searchable) {
      window.setTimeout(() => searchRef.current?.focus(), 40);
    }
  }, [open, searchable]);

  function selectLanguage(language) {
    onChange(language.code);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className={`language-select ${compact ? "is-compact" : ""}`} ref={rootRef} dir={dir}>
      <button
        type="button"
        className="language-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="language-selected-value">
          {selected ? (
            <>
              <FlagIcon code={selected.flagCode} label={selected.name} />
              <strong className="language-name">{selected.name}</strong>
              <small className="language-code">{selected.code.toUpperCase()}</small>
            </>
          ) : (
            labels.placeholder
          )}
        </span>
        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="language-select-menu">
          {searchable && (
            <div className="language-select-search">
              <Search size={16} />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labels.searchPlaceholder}
                autoComplete="off"
              />
            </div>
          )}

          <div className="language-select-options" role="listbox" aria-label={labels.placeholder}>
            {filteredLanguages.map((language) => (
              <button
                type="button"
                role="option"
                aria-selected={language.code === value}
                className="language-select-option"
                key={language.code}
                onClick={() => selectLanguage(language)}
              >
                <span className="language-option-check" aria-hidden="true">
                  {language.code === value && <Check size={16} />}
                </span>
                <FlagIcon code={language.flagCode} label={language.name} />
                <span className="language-name">{language.name}</span>
                <small className="language-code">{language.code.toUpperCase()}</small>
              </button>
            ))}

            {!filteredLanguages.length && <p className="language-select-empty">{labels.noResults}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
