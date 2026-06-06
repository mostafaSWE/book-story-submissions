"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import FlagIcon from "@/components/FlagIcon";
import { getLocalizedCountries } from "@/lib/countries";

export default function CountrySelect({ language, dir, value, onChange, labels, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const countries = useMemo(() => getLocalizedCountries(language), [language]);
  const selected = value?.code ? countries.find((country) => country.code === value.code) : null;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredCountries = useMemo(() => {
    if (!normalizedQuery) return countries;
    return countries.filter((country) => {
      const searchable = `${country.name} ${country.code}`.toLocaleLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [countries, normalizedQuery]);

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
    if (open) {
      window.setTimeout(() => searchRef.current?.focus(), 40);
    }
  }, [open]);

  function selectCountry(country) {
    onChange({ code: country.code, name: country.name });
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="country-select" ref={rootRef} dir={dir}>
      <button
        type="button"
        className={`country-trigger ${error ? "has-error" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          {selected ? (
            <>
              <FlagIcon code={selected.flagCode} label={selected.name} />
              {selected.name}
              <small>{selected.code}</small>
            </>
          ) : (
            labels.placeholder
          )}
        </span>
        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="country-menu">
          <div className="country-search">
            <Search size={16} />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              autoComplete="off"
            />
          </div>

          <div className="country-options" role="listbox" aria-label={labels.placeholder}>
            {filteredCountries.map((country) => (
              <button
                type="button"
                role="option"
                aria-selected={country.code === value?.code}
                className="country-option"
                key={country.code}
                onClick={() => selectCountry(country)}
              >
                <FlagIcon code={country.flagCode} label={country.name} />
                <span>{country.name}</span>
                <small>{country.code}</small>
                {country.code === value?.code && <Check size={16} />}
              </button>
            ))}

            {!filteredCountries.length && <p className="country-empty">{labels.noResults}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
