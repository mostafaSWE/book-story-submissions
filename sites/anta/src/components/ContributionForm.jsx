"use client";

import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from "react";
import { submitContribution } from "@/app/[lang]/write/actions";
import { callingCode, countryGroups, DEFAULT_REGION, isRegion, parsePhone } from "@/lib/phone";
import { graphemeCount } from "@/lib/text";
import { FIELD_ORDER, LIMITS, normalizeInput, validate } from "@/lib/validation";
import { CheckMark, ChevronIcon, Nib } from "./Icons";

const DRAFT_KEY = "anta:draft";
const SENT_KEY = "anta:sent";
const TEXT_FIELDS = ["title", "body", "name", "email", "phone"];
const LRI = String.fromCharCode(0x2066); // isolate "+971" inside RTL option text
const PDI = String.fromCharCode(0x2069);
const PHONE_PLACEHOLDER = { AE: "50 123 4567", SA: "51 234 5678", KW: "5000 0000", QA: "3312 3456", BH: "3600 1234", OM: "9212 3456" };

const store = {
  get(key) {
    try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; }
  },
  set(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: drafts just aren't kept */ }
  },
  del(key) {
    try { sessionStorage.removeItem(key); } catch { /* ignore */ }
  }
};

export default function ContributionForm({ lang, m, groups: initialGroups, aside }) {
  const [groups, setGroups] = useState(initialGroups);
  const [state, formAction, pending] = useActionState(submitContribution, null);
  const [jsReady, setJsReady] = useState(false);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [bodyCount, setBodyCount] = useState(0);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [phoneOk, setPhoneOk] = useState("");
  const [sent, setSent] = useState(null);
  const [toast, setToast] = useState("");

  const formRef = useRef(null);
  const summaryRef = useRef(null);
  const startedRef = useRef(null);
  const regionTouched = useRef(false);
  const handledState = useRef(null);
  const draftTimer = useRef(null);

  const nf = new Intl.NumberFormat(m.meta.locale);
  const regionName = (code) => {
    try { return new Intl.DisplayNames([lang, "en"], { type: "region" }).of(code) || code; } catch { return code; }
  };
  const inList = (code) => isRegion(code);

  const t = (key, vars) => {
    const value = key.split(".").reduce((node, part) => (node == null ? node : node[part]), m);
    return String(value ?? key).replace(/\{(\w+)\}/g, (_, name) => (vars && vars[name] != null ? vars[name] : ""));
  };
  const messageFor = (err) => {
    const vars = { ...err.vars };
    if (vars.min != null) vars.min = nf.format(vars.min);
    if (vars.max != null) vars.max = nf.format(vars.max);
    if (vars.region) vars.country = regionName(vars.region);
    return t(`errors.${err.code}`, vars);
  };

  const el = (name) => formRef.current?.elements.namedItem(name);
  const read = useCallback(() => ({
    title: el("title")?.value ?? "",
    body: el("body")?.value ?? "",
    name: el("name")?.value ?? "",
    email: el("email")?.value ?? "",
    phone: el("phone")?.value ?? "",
    region: el("region")?.value ?? DEFAULT_REGION,
    consent: el("consent")?.checked ?? false
  }), []);

  const validateFields = useCallback((fields) => {
    const found = validate(normalizeInput(read()), lang, fields);
    setErrors((current) => {
      const next = { ...current };
      for (const f of fields) {
        if (found[f]) next[f] = found[f];
        else delete next[f];
      }
      return next;
    });
    return found;
  }, [lang, read]);

  const updatePhoneHint = useCallback((raw, reg) => {
    const p = parsePhone(raw, reg);
    // Typed "+966…" while UAE is selected → switch to Saudi Arabia. Regions sharing a calling code (+1, +44, +7…) keep the user's choice.
    if (p.ok && callingCode(p.region) !== callingCode(reg) && inList(p.region)) setRegion(p.region);
    setPhoneOk(p.ok ? p.formatted : "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDraft = useCallback((extra = {}) => {
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      store.set(DRAFT_KEY, { ...read(), regionTouched: regionTouched.current, attempted, ...extra });
    }, 250);
  }, [attempted, read]);

  // The rest of the world joins the country list right after first paint (Gulf and Arab states ship first).
  useEffect(() => {
    if (groups.some((g) => g.key === "world")) return undefined;
    const add = () => setGroups(countryGroups(lang));
    const id = "requestIdleCallback" in window ? requestIdleCallback(add, { timeout: 1500 }) : setTimeout(add, 300);
    return () => ("cancelIdleCallback" in window ? cancelIdleCallback(id) : clearTimeout(id));
  }, [groups, lang]);

  // Warm the full writing face once the page has painted, so it's ready before the first keystroke.
  useEffect(() => {
    if (lang !== "ar" || !document.fonts?.load) return undefined;
    const warm = () => document.fonts.load('400 20px "Amiri"', "اكتب").catch(() => {});
    const id = "requestIdleCallback" in window ? requestIdleCallback(warm, { timeout: 2500 }) : setTimeout(warm, 1200);
    return () => ("cancelIdleCallback" in window ? cancelIdleCallback(id) : clearTimeout(id));
  }, [lang]);

  // Restore a draft (e.g. after switching language) or a finished submission; pick the phone country.
  useEffect(() => {
    setJsReady(true);
    startedRef.current = Date.now();
    const sentBefore = store.get(SENT_KEY);
    if (sentBefore) {
      setSent(sentBefore);
      return;
    }
    const draft = store.get(DRAFT_KEY);
    if (draft) {
      for (const f of TEXT_FIELDS) if (el(f) && draft[f]) el(f).value = draft[f];
      if (el("consent")) el("consent").checked = !!draft.consent;
      regionTouched.current = !!draft.regionTouched;
      const reg = inList(draft.region) ? draft.region : DEFAULT_REGION;
      setRegion(reg);
      setBodyCount(graphemeCount(draft.body || "", lang));
      updatePhoneHint(draft.phone || "", reg);
      if (draft.attempted) {
        setAttempted(true);
        setTimeout(() => validateFields(FIELD_ORDER), 0); // errors re-appear in the new language
      }
    }
    if (!regionTouched.current && !(draft && draft.phone)) {
      fetch("/api/country")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.country && inList(data.country) && !regionTouched.current) setRegion(data.country);
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Server answers.
  useEffect(() => {
    if (!state || handledState.current === state) return;
    handledState.current = state;
    if (state.status === "ok") {
      finish(state.submitted);
    } else if (state.status === "invalid") {
      setErrors(state.fieldErrors || {});
      setSummaryOpen(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
    } else {
      setStatus({ duplicate: "duplicate", rate_limited: "rateLimited" }[state.status] || "generic");
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (sent) {
      window.scrollTo(0, 0);
      document.getElementById("thanks-heading")?.focus({ preventScroll: true });
    }
  }, [sent]);

  function finish(submitted) {
    // Keep who they are for "write another"; clear the words, title and consent.
    const v = read();
    store.set(DRAFT_KEY, { name: v.name, email: v.email, phone: v.phone, region: v.region, regionTouched: regionTouched.current });
    store.set(SENT_KEY, submitted);
    setSent(submitted);
  }

  function onSubmit(event) {
    event.preventDefault();
    setAttempted(true);
    setStatus("");
    const found = validate(normalizeInput(read()), lang);
    setErrors(found);
    if (Object.keys(found).length) {
      setSummaryOpen(true);
      saveDraft({ attempted: true });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSummaryOpen(false);
    const data = new FormData(formRef.current);
    startTransition(() => formAction(data));
  }

  function writeAnother() {
    store.del(SENT_KEY);
    const keep = store.get(DRAFT_KEY) || {};
    setSent(null);
    setErrors({});
    setAttempted(false);
    setStatus("");
    setBodyCount(0);
    startedRef.current = Date.now();
    // Keep name and contact details; clear the text, title and consent.
    if (keep.region && inList(keep.region)) setRegion(keep.region);
    requestAnimationFrame(() => {
      for (const f of ["name", "email", "phone"]) if (el(f) && keep[f]) el(f).value = keep[f];
      updatePhoneHint(keep.phone || "", keep.region || region);
      document.getElementById("write-heading")?.focus({ preventScroll: true });
    });
  }

  async function share() {
    const url = `${location.origin}/${lang}`;
    const data = { title: m.title, text: m.shareText, url };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* dismissed */ }
      return;
    }
    try { await navigator.clipboard.writeText(`${data.text} ${url}`); } catch { /* ignore */ }
    setToast(m.linkCopied);
    setTimeout(() => setToast(""), 2500);
  }

  // Without JavaScript, the server's answer is the only state there is.
  const shownErrors = jsReady ? errors : state?.fieldErrors || {};
  const shownStatus = jsReady ? status : state && !["ok", "invalid"].includes(state.status) ? ({ duplicate: "duplicate", rate_limited: "rateLimited" }[state.status] || "generic") : "";
  const thanks = sent || (!jsReady && state?.status === "ok" ? state.submitted : null);
  const summaryKeys = FIELD_ORDER.filter((k) => shownErrors[k]);
  const showSummary = (jsReady ? summaryOpen : summaryKeys.length > 0) && summaryKeys.length > 0;
  const fieldError = (k) => (shownErrors[k] ? messageFor(shownErrors[k]) : "");
  const invalid = (k) => (shownErrors[k] ? "true" : undefined);

  const inputHandlers = (field) => ({
    onBlur: (e) => {
      // Deferred: blur fires on mousedown of the next control; an error appearing now would push that
      // control down before mouseup and swallow the click (regression test: consent after invalid phone).
      if (e.target.value.trim() || attempted) setTimeout(() => validateFields([field]), 250);
    },
    onInput: (e) => {
      if (errors[field]) validateFields([field]);
      setStatus("");
      if (field === "body") setBodyCount(graphemeCount(e.target.value, lang));
      if (field === "phone") updatePhoneHint(e.target.value, el("region")?.value || region);
      saveDraft();
    }
  });

  if (thanks) {
    return (
      <div className="view view-thanks">
        <section className="thanks" aria-labelledby="thanks-heading">
          <Nib className="nib nib-large" />
          <h1 id="thanks-heading" className="thanks-title" tabIndex={-1}>{m.thanksTitle}</h1>
          <p className="thanks-body">{m.thanksBody}</p>
          <figure className="their-words">
            <figcaption>{m.thanksPreview}</figcaption>
            {thanks.title ? <p className="their-title">{thanks.title}</p> : null}
            <blockquote>
              <p className="their-text">{lang === "ar" ? `«${thanks.body}»` : `“${thanks.body}”`}</p>
            </blockquote>
            <p className="their-name">{`— ${thanks.name}`}</p>
          </figure>
          <div className="thanks-actions">
            <button type="button" className="button button-primary share" onClick={share}>
              <span>{m.share}</span>
            </button>
            <a className="button button-quiet" href={`/${lang}/write`} onClick={(e) => { e.preventDefault(); writeAnother(); }}>
              <span>{m.writeAnother}</span>
            </a>
            <a className="text-link" href={`/${lang}`} onClick={() => store.del(SENT_KEY)}>{m.home}</a>
          </div>
          <p className="toast" role="status" aria-live="polite">{toast}</p>
        </section>
      </div>
    );
  }

  const dial = callingCode(region);
  return (
    <div className="view view-write">
      <div className="write-grid">
        <section className="write-main" aria-labelledby="write-heading">
          <h1 id="write-heading" className="write-title" tabIndex={-1}>{m.formTitle}</h1>
          <p className="write-intro">{m.formIntro}</p>

          <div className="error-summary" role="alert" tabIndex={-1} ref={summaryRef} hidden={!showSummary}>
            <p className="error-summary-title">{m.errors.summary}</p>
            <ul>
              {summaryKeys.map((k) => (
                <li key={k}>
                  <a href={`#f-${k}`} onClick={(e) => { e.preventDefault(); el(k)?.focus(); }}>{fieldError(k)}</a>
                </li>
              ))}
            </ul>
          </div>

          <form className="contribution" noValidate ref={formRef} action={formAction} onSubmit={onSubmit}>
            <input type="hidden" name="lang" value={lang} />
            <input type="hidden" name="startedAt" value={jsReady && startedRef.current ? String(startedRef.current) : ""} />

            <div className="sheet">
              <div className="field field-line" data-field="title">
                <label htmlFor="f-title">
                  <span>{m.titleLabel}</span> <span className="optional">(<span>{m.optional}</span>)</span>
                </label>
                <input id="f-title" name="title" type="text" autoComplete="off" placeholder=" " aria-invalid={invalid("title")} aria-describedby="f-title-err" {...inputHandlers("title")} />
                <p className="field-error" id="f-title-err" hidden={!shownErrors.title}>{fieldError("title")}</p>
              </div>

              <div className="field field-page" data-field="body">
                <label htmlFor="f-body">{m.bodyLabel}</label>
                <textarea id="f-body" name="body" rows={5} required aria-required="true" placeholder={m.bodyPlaceholder} aria-invalid={invalid("body")} aria-describedby="f-body-hint f-body-count f-body-err" {...inputHandlers("body")} />
                <div className="field-meta">
                  <span id="f-body-hint">{m.bodyHint}</span>
                  <span id="f-body-count" className={`counter${bodyCount > LIMITS.bodyMax ? " is-over" : bodyCount > LIMITS.bodyMax * 0.85 ? " is-near" : ""}`}>
                    {t("counter", { n: nf.format(bodyCount), max: nf.format(LIMITS.bodyMax) })}
                  </span>
                </div>
                <p className="field-error" id="f-body-err" hidden={!shownErrors.body}>{fieldError("body")}</p>
              </div>

              <div className="field field-line" data-field="name">
                <label htmlFor="f-name">{m.nameLabel}</label>
                <input id="f-name" name="name" type="text" autoComplete="name" placeholder=" " required aria-required="true" aria-invalid={invalid("name")} aria-describedby="f-name-hint f-name-err" {...inputHandlers("name")} />
                <p className="field-hint" id="f-name-hint">{m.nameHint}</p>
                <p className="field-error" id="f-name-err" hidden={!shownErrors.name}>{fieldError("name")}</p>
              </div>
            </div>

            <fieldset className="contact">
              <legend>{m.contactLegend}</legend>

              <div className="field field-box" data-field="email">
                <label htmlFor="f-email">{m.emailLabel}</label>
                <input id="f-email" name="email" type="email" dir="ltr" inputMode="email" autoComplete="email" autoCapitalize="off" spellCheck={false} placeholder="name@example.com" required aria-required="true" aria-invalid={invalid("email")} aria-describedby="f-email-err" {...inputHandlers("email")} />
                <p className="field-error" id="f-email-err" hidden={!shownErrors.email}>{fieldError("email")}</p>
              </div>

              <div className="field field-box" data-field="phone">
                <label htmlFor="f-phone">{m.phoneLabel}</label>
                <div className="phone" dir="ltr">
                  <div className="phone-country">
                    <span className="phone-dial" aria-hidden="true">{`+${dial}`}</span>
                    <ChevronIcon />
                    <select
                      id="f-country"
                      name="region"
                      aria-label={m.countryLabel}
                      dir={m.meta.dir}
                      value={region}
                      onChange={(e) => {
                        regionTouched.current = true;
                        setRegion(e.target.value);
                        updatePhoneHint(el("phone")?.value || "", e.target.value);
                        if (errors.phone) setTimeout(() => validateFields(["phone"]), 0);
                        saveDraft();
                      }}
                    >
                      {groups.map((g) => (
                        <optgroup key={g.key} label={m[{ gcc: "countriesGcc", arab: "countriesArab", world: "countriesWorld" }[g.key]]}>
                          {g.countries.map((c) => (
                            <option key={c.code} value={c.code}>{`${c.name}  ${LRI}+${c.dial}${PDI}`}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder={PHONE_PLACEHOLDER[region] || ""} required aria-required="true" aria-invalid={invalid("phone")} aria-describedby="f-phone-ok f-phone-err" {...inputHandlers("phone")} />
                </div>
                <p className="field-ok" id="f-phone-ok" hidden={!phoneOk}>
                  {phoneOk ? (() => { const [a, b] = m.phoneSaved.split("{formatted}"); return <>{a}<bdi dir="ltr">{phoneOk}</bdi>{b}</>; })() : null}
                </p>
                <p className="field-error" id="f-phone-err" hidden={!shownErrors.phone}>{fieldError("phone")}</p>
              </div>
            </fieldset>

            {/* Honeypot: same field name as the original site. Hidden from people and assistive tech. */}
            <div className="hp" aria-hidden="true">
              <label>Website <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <div className="field consent" data-field="consent">
              <label className="check">
                <input
                  id="f-consent"
                  name="consent"
                  type="checkbox"
                  required
                  aria-required="true"
                  aria-invalid={invalid("consent")}
                  aria-describedby="f-consent-err"
                  onChange={() => {
                    if (errors.consent || attempted) validateFields(["consent"]);
                    saveDraft();
                  }}
                />
                <span className="check-box" aria-hidden="true"><CheckMark /></span>
                <span className="check-label">{m.consent}</span>
              </label>
              <p className="field-error" id="f-consent-err" hidden={!shownErrors.consent}>{fieldError("consent")}</p>
            </div>

            <p className="privacy">
              {m.privacy} <a href={`/${lang}/privacy`}>{m.privacyLink}</a>
            </p>
            <p className="form-status" role="status" aria-live="polite">{shownStatus ? t(`errors.${shownStatus}`) : ""}</p>

            <button className="button button-primary submit" type="submit" aria-busy={pending ? "true" : undefined}>
              <span className="submit-label">{pending ? m.submitting : m.submit}</span>
              <span className="spinner" aria-hidden="true" />
            </button>
          </form>
        </section>
        {aside}
      </div>
    </div>
  );
}
