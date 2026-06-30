"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Globe2,
  ImageUp,
  Loader2,
  PenLine,
  ScrollText,
  Sparkles,
  Upload,
  X
} from "lucide-react";
import BrandMark from "@/components/BrandMark";
import CountrySelect from "@/components/CountrySelect";
import LanguageSelect from "@/components/LanguageSelect";
import { getLanguage, languages, translations } from "@/lib/i18n";
import { getTermsContent } from "@/lib/terms";
import { MAX_IMAGE_SIZE, MAX_STORY_TEXT_LENGTH } from "@/lib/validation";

const journeySteps = ["intro", "info", "story", "thanks"];

function detectBrowserLanguage() {
  if (typeof navigator === "undefined") return "en";
  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return languages.some((language) => language.code === browserLanguage) ? browserLanguage : "en";
}

function FieldError({ children }) {
  if (!children) return null;
  return <p className="field-error">{children}</p>;
}

function BookCover({ title }) {
  return (
    <figure className="book-cover-showcase">
      <span className="book-cover-glow" aria-hidden="true" />
      <img src="/images/COVER.webp" alt={title} decoding="async" />
    </figure>
  );
}

export default function StoryJourney() {
  const [language, setLanguage] = useState("en");
  const [step, setStep] = useState("language");
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(true);
  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    email: "",
    country: "",
    countryCode: "",
    storyText: ""
  });
  const [receipt, setReceipt] = useState(null);
  const [storyImages, setStoryImages] = useState([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const receiptRef = useRef(null);
  const storyImagesRef = useRef([]);
  const storyFileInputRef = useRef(null);
  const storyTextareaRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const languageConfig = getLanguage(language);
  const copy = translations[languageConfig.code] || translations.en;
  const terms = getTermsContent(languageConfig.code);
  const dir = languageConfig.dir;
  const activeStepIndex = Math.max(0, journeySteps.indexOf(step));
  const storyCharacterCount = values.storyText.length;
  const numberFormatter = useMemo(() => new Intl.NumberFormat(languageConfig.code), [languageConfig.code]);
  const formattedStoryLimit = numberFormatter.format(MAX_STORY_TEXT_LENGTH);
  const storyLimitHint = copy.storyLimitHint.replace("{limit}", formattedStoryLimit);
  const storyTooLongMessage = copy.storyTooLong.replace("{limit}", formattedStoryLimit);

  useEffect(() => {
    setLanguage(detectBrowserLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = languageConfig.code;
    document.documentElement.dir = dir;
  }, [dir, languageConfig.code]);

  useEffect(() => {
    receiptRef.current = receipt;
  }, [receipt]);

  useEffect(() => {
    storyImagesRef.current = storyImages;
  }, [storyImages]);

  useEffect(() => {
    return () => {
      if (receiptRef.current?.preview) URL.revokeObjectURL(receiptRef.current.preview);
      storyImagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  useEffect(() => {
    if (!showTerms) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event) {
      if (event.key === "Escape") setShowTerms(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showTerms]);

  const progressLabels = useMemo(
    () => [copy.stepIntro, copy.stepInfo, copy.stepStory, copy.stepDone],
    [copy.stepDone, copy.stepInfo, copy.stepIntro, copy.stepStory]
  );

  function updateValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setServerMessage("");
  }

  function validateImage(file) {
    if (!file?.type?.startsWith("image/")) return copy.imageOnly;
    if (file.size > MAX_IMAGE_SIZE) return copy.fileTooLarge;
    return "";
  }

  function handleReceiptChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = validateImage(file);
    if (error) {
      setErrors((current) => ({ ...current, receiptImage: error }));
      return;
    }

    if (receipt?.preview) URL.revokeObjectURL(receipt.preview);
    setReceipt({ file, preview: URL.createObjectURL(file) });
    setErrors((current) => ({ ...current, receiptImage: "" }));
    setServerMessage("");
  }

  function removeReceipt() {
    if (receipt?.preview) URL.revokeObjectURL(receipt.preview);
    setReceipt(null);
  }

  function handleStoryImagesChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedFiles.length) return;

    const nextImages = [...storyImages];
    let nextError = "";

    for (const file of selectedFiles) {
      if (nextImages.length >= 3) {
        nextError = copy.maxImages;
        break;
      }

      const error = validateImage(file);
      if (error) {
        nextError = error;
        continue;
      }

      nextImages.push({ file, preview: URL.createObjectURL(file) });
    }

    setStoryImages(nextImages);
    setErrors((current) => ({ ...current, storyImages: nextError, storyText: "" }));
    setServerMessage("");
  }

  function removeStoryImage(index) {
    setStoryImages((current) => {
      const target = current[index];
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  }

  function validateInfo() {
    const nextErrors = {};
    if (!values.fullName.trim()) nextErrors.fullName = copy.required;
    if (!values.phone.trim()) nextErrors.phone = copy.required;
    if (values.phone.trim() && !/^[+\d][\d\s().-]{6,24}$/.test(values.phone.trim())) {
      nextErrors.phone = copy.invalidPhone;
    }
    if (!values.email.trim()) nextErrors.email = copy.required;
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = copy.invalidEmail;
    }
    if (!values.country.trim()) nextErrors.country = copy.required;
    if (!values.countryCode.trim()) nextErrors.country = copy.countryRequired || copy.required;
    if (!receipt) nextErrors.receiptImage = copy.receiptRequired;
    return nextErrors;
  }

  function validateStory() {
    const nextErrors = {};
    if (!values.storyText.trim() && storyImages.length === 0) {
      nextErrors.storyText = copy.storyRequired;
    }
    if (values.storyText.length > MAX_STORY_TEXT_LENGTH) {
      nextErrors.storyText = storyTooLongMessage;
    }
    if (!acceptedTerms) {
      nextErrors.terms = terms.termsRequired;
    }
    return nextErrors;
  }

  function goToInfo() {
    setErrors({});
    setServerMessage("");
    setStep("info");
  }

  function goToStory() {
    const nextErrors = validateInfo();
    setErrors(nextErrors);
    setServerMessage(Object.keys(nextErrors).length ? copy.fixErrors : "");
    if (!Object.keys(nextErrors).length) setStep("story");
  }

  async function submitStory() {
    const infoErrors = validateInfo();
    const storyErrors = validateStory();
    const nextErrors = { ...infoErrors, ...storyErrors };
    setErrors(nextErrors);
    setServerMessage(Object.keys(nextErrors).length ? copy.fixErrors : "");
    if (Object.keys(nextErrors).length) return;

    const formData = new FormData();
    formData.append("selectedLanguage", languageConfig.code);
    formData.append("fullName", values.fullName);
    formData.append("phone", values.phone);
    formData.append("email", values.email);
    formData.append("country", values.country);
    formData.append("countryCode", values.countryCode);
    formData.append("storyText", values.storyText);
    formData.append("acceptedTerms", acceptedTerms ? "true" : "false");
    formData.append("website", "");
    formData.append("receiptImage", receipt.file);
    storyImages.forEach((image) => formData.append("storyImages", image.file));

    setSubmitting(true);
    setServerMessage("");

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(result.fieldErrors || {});
        setServerMessage(result.error || copy.genericError);
        return;
      }

      setStep("thanks");
      setServerMessage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerMessage(copy.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  function renderProgress() {
    if (step === "language") return null;

    return (
      <nav className="journey-progress" aria-label="Progress">
        {progressLabels.map((label, index) => (
          <div
            key={label}
            className={`progress-item ${index <= activeStepIndex ? "is-active" : ""} ${
              index < activeStepIndex ? "is-complete" : ""
            }`}
          >
            <span>{index < activeStepIndex ? <CheckCircle2 size={16} /> : index + 1}</span>
            <small>{label}</small>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <section className="journey" dir={dir}>
      <div className="hero-bg" aria-hidden="true" />
      <div className="golden-vignette" aria-hidden="true" />
      <div className="ambient-particles" aria-hidden="true">
        {Array.from({ length: 22 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--x": `${(index * 47) % 100}%`,
              "--y": `${8 + ((index * 29) % 78)}%`,
              "--delay": `${index * 0.28}s`,
              "--size": `${2 + (index % 4)}px`
            }}
          />
        ))}
      </div>

      <div className="journey-shell">
        <header className="brand-strip">
          <div className="brand-lockup">
            <BrandMark />
            <span>
              <small>{copy.projectLabel}</small>
              <strong>{copy.bookTitle}</strong>
            </span>
          </div>

          {step !== "language" && (
            <div className="language-switch">
              <span>{copy.changeLanguage}</span>
              <LanguageSelect
                value={language}
                onChange={setLanguage}
                dir={dir}
                compact
                searchable={false}
                labels={{
                  placeholder: copy.languageSelectPlaceholder,
                  searchPlaceholder: copy.languageSearchPlaceholder,
                  noResults: copy.languageNoResults
                }}
              />
            </div>
          )}
        </header>

        {renderProgress()}

        {step === "language" && (
          <div className="screen language-screen">
            <div className="welcome-copy">
              <span className="screen-kicker">
                <Globe2 size={18} />
                {copy.welcomeBadge || copy.projectLabel}
              </span>
              <h1>{copy.languageWelcome}</h1>
              <p>{copy.languageSubtitle}</p>
              <div className="welcome-quote">
                <Sparkles size={18} />
                <span>{copy.welcomeQuote || copy.tagline}</span>
              </div>
            </div>

            <div className="landing-panel-stack">
              <BookCover title={copy.bookTitle} />

              <div className="language-panel">
                <div>
                  <strong>{copy.changeLanguage}</strong>
                  <p>{copy.tagline}</p>
                </div>
                <LanguageSelect
                  value={language}
                  onChange={(code) => {
                    setLanguage(code);
                    setHasSelectedLanguage(true);
                  }}
                  dir={dir}
                  labels={{
                    placeholder: copy.languageSelectPlaceholder,
                    searchPlaceholder: copy.languageSearchPlaceholder,
                    noResults: copy.languageNoResults
                  }}
                />
                {hasSelectedLanguage && (
                  <button className="primary-button language-continue" type="button" onClick={() => setStep("intro")}>
                    {copy.continueWith} {languageConfig.name}
                    {dir === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === "intro" && (
          <div className="screen intro-screen">
            <div className="intro-copy">
              <span className="screen-kicker">
                <Sparkles size={18} />
                {copy.tagline}
              </span>
              <h1>{copy.bookTitle}</h1>
              <p>{copy.introCopy}</p>
              <button className="primary-button" type="button" onClick={goToInfo}>
                <PenLine size={18} />
                {copy.start}
                {dir === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>

            <BookCover title={copy.bookTitle} />
          </div>
        )}

        {step === "info" && (
          <div className="screen form-screen">
            <div className="form-grid">
              <label className="field">
                <span>{copy.fullName}</span>
                <input
                  value={values.fullName}
                  onChange={(event) => updateValue("fullName", event.target.value)}
                  autoComplete="name"
                />
                <FieldError>{errors.fullName}</FieldError>
              </label>

              <label className="field">
                <span>{copy.phone}</span>
                <input
                  value={values.phone}
                  onChange={(event) => updateValue("phone", event.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  dir="ltr"
                />
                <FieldError>{errors.phone}</FieldError>
              </label>

              <label className="field">
                <span>{copy.email}</span>
                <input
                  value={values.email}
                  onChange={(event) => updateValue("email", event.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  dir="ltr"
                />
                <FieldError>{errors.email}</FieldError>
              </label>

              <label className="field">
                <span>{copy.country}</span>
                <CountrySelect
                  language={languageConfig.code}
                  dir={dir}
                  value={{ code: values.countryCode, name: values.country }}
                  onChange={(country) => {
                    setValues((current) => ({
                      ...current,
                      country: country.name,
                      countryCode: country.code
                    }));
                    setErrors((current) => ({ ...current, country: "" }));
                    setServerMessage("");
                  }}
                  labels={{
                    placeholder: copy.countryPlaceholder,
                    searchPlaceholder: copy.countrySearchPlaceholder,
                    noResults: copy.countryNoResults
                  }}
                  error={errors.country}
                />
                <FieldError>{errors.country}</FieldError>
              </label>
            </div>

            <div className="upload-zone">
              <div>
                <strong>{copy.receipt}</strong>
                <p>{copy.receiptHint}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <label className="file-button" style={{ flex: 1, width: 'auto' }}>
                  <Upload size={18} />
                  {copy.upload}
                  <input type="file" accept="image/*" onChange={handleReceiptChange} />
                </label>
                <label className="file-button" style={{ flex: '0 0 auto', padding: '0 14px', width: 'auto' }} aria-label="Camera" title="Camera">
                  <Camera size={18} />
                  <input type="file" accept="image/*" capture="environment" onChange={handleReceiptChange} />
                </label>
              </div>
              {receipt && (
                <figure className="image-preview single-preview">
                  <img src={receipt.preview} alt="" />
                  <button type="button" onClick={removeReceipt} aria-label={copy.remove}>
                    <X size={16} />
                  </button>
                </figure>
              )}
              <FieldError>{errors.receiptImage}</FieldError>
            </div>

            {serverMessage && <p className="server-message">{serverMessage}</p>}

            <div className="button-row">
              <button className="secondary-button" type="button" onClick={() => setStep("intro")}>
                {dir === "rtl" ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                {copy.back}
              </button>
              <button className="primary-button" type="button" onClick={goToStory}>
                {copy.next}
                {dir === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        )}

        {step === "story" && (
          <div className="screen form-screen">
            <div className="story-choice-head">
              <span className="screen-kicker">
                <Sparkles size={18} />
                {copy.stepStory}
              </span>
              <h2>{copy.storyQuestion}</h2>
            </div>

            <div className="story-flow-note">
              <Sparkles size={16} />
              <span>{copy.storyQuestionHint}</span>
            </div>

            <div className="story-entry-grid">
              <section className={`story-entry-panel story-text-panel ${values.storyText.trim() ? "has-content" : ""}`}>
                <div className="story-entry-title">
                  <span className="story-entry-number">1</span>
                  <PenLine size={22} />
                  <span>
                    <strong>{copy.writeStoryTitle}</strong>
                    <small>{copy.writeStoryHint}</small>
                  </span>
                </div>
                <label className="field story-text-field">
                  <span>{copy.storyText}</span>
                  <textarea
                    ref={storyTextareaRef}
                    value={values.storyText}
                    onChange={(event) => updateValue("storyText", event.target.value)}
                    placeholder={copy.storyPlaceholder}
                    maxLength={MAX_STORY_TEXT_LENGTH}
                    rows={8}
                  />
                  <span className="field-help story-limit-row">
                    <span>{storyLimitHint}</span>
                    <span className={storyCharacterCount > MAX_STORY_TEXT_LENGTH ? "is-over-limit" : ""}>
                      {numberFormatter.format(storyCharacterCount)} / {numberFormatter.format(MAX_STORY_TEXT_LENGTH)}
                    </span>
                  </span>
                  <FieldError>{errors.storyText}</FieldError>
                </label>
              </section>

              <section className={`story-entry-panel story-photo-panel ${storyImages.length ? "has-content" : ""}`}>
                <div className="story-entry-title">
                  <span className="story-entry-number">2</span>
                  <ImageUp size={22} />
                  <span>
                    <strong>{copy.uploadStoryTitle}</strong>
                    <small>{copy.uploadStoryHint}</small>
                  </span>
                </div>
                <div className="story-upload-actions">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label className="file-button" style={{ flex: 1, width: 'auto' }}>
                      <ImageUp size={18} />
                      {copy.addImages} ({storyImages.length}/3)
                      <input
                        ref={storyFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleStoryImagesChange}
                        disabled={storyImages.length >= 3}
                      />
                    </label>
                    <label className="file-button" style={{ flex: '0 0 auto', padding: '0 14px', width: 'auto' }} aria-label="Camera" title="Camera">
                      <Camera size={18} />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={handleStoryImagesChange}
                        disabled={storyImages.length >= 3}
                      />
                    </label>
                  </div>
                  <p>{copy.storyImagesHint}</p>
                </div>
                {storyImages.length > 0 && (
                  <div className="preview-grid">
                    {storyImages.map((image, index) => (
                      <figure className="image-preview" key={`${image.file.name}-${index}`}>
                        <img src={image.preview} alt="" />
                        <button type="button" onClick={() => removeStoryImage(index)} aria-label={copy.remove}>
                          <X size={16} />
                        </button>
                      </figure>
                    ))}
                  </div>
                )}
                <FieldError>{errors.storyImages}</FieldError>
              </section>
            </div>

            <div className="terms-consent">
              <label className={`terms-check ${errors.terms ? "has-error" : ""}`}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    setErrors((current) => ({ ...current, terms: "" }));
                    setServerMessage("");
                  }}
                />
                <span className="terms-check-box" aria-hidden="true">
                  <Check size={15} strokeWidth={3} />
                </span>
                <span className="terms-check-label">
                  {terms.acceptTerms.split("{terms}").map((part, index, parts) => (
                    <span key={index}>
                      {part}
                      {index < parts.length - 1 && (
                        <button
                          type="button"
                          className="terms-inline-link"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setShowTerms(true);
                          }}
                        >
                          {terms.termsLinkText}
                        </button>
                      )}
                    </span>
                  ))}
                </span>
              </label>
              <FieldError>{errors.terms}</FieldError>
            </div>

            {serverMessage && <p className="server-message">{serverMessage}</p>}

            <div className="button-row">
              <button className="secondary-button" type="button" onClick={() => setStep("info")}>
                {dir === "rtl" ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                {copy.back}
              </button>
              <button className="primary-button" type="button" onClick={submitStory} disabled={submitting}>
                {submitting ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                {submitting ? copy.submitting : copy.submit}
              </button>
            </div>
          </div>
        )}

        {step === "thanks" && (
          <div className="screen success-screen">
            <span className="success-orbit">
              <CheckCircle2 size={42} />
            </span>
            <h1>{copy.successTitle}</h1>
            <p>{copy.successCopy}</p>
          </div>
        )}
      </div>

      {showTerms && (
        <div className="terms-modal" role="dialog" aria-modal="true" aria-label={terms.title} dir={dir}>
          <button
            type="button"
            className="terms-modal-backdrop"
            aria-label={copy.back}
            onClick={() => setShowTerms(false)}
          />
          <div className="terms-modal-panel">
            <header className="terms-modal-head">
              <div className="terms-modal-title">
                <ScrollText size={20} />
                <h2>{terms.title}</h2>
              </div>
              <button
                type="button"
                className="terms-modal-close"
                aria-label={copy.back}
                onClick={() => setShowTerms(false)}
              >
                <X size={20} />
              </button>
            </header>
            <div className="terms-modal-body">
              <ol className="terms-list">
                {terms.clauses.map((clause, index) => (
                  <li key={index}>{clause}</li>
                ))}
              </ol>
            </div>
            <footer className="terms-modal-foot">
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setErrors((current) => ({ ...current, terms: "" }));
                  setServerMessage("");
                  setShowTerms(false);
                }}
              >
                <Check size={18} strokeWidth={3} />
                {terms.agree}
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
