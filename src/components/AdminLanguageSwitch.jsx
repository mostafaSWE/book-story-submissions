"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLanguageSwitch({ value, label }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changeLanguage(event) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("adminLang", event.target.value === "ar" ? "ar" : "en");
    router.push(`/admin?${params.toString()}`);
  }

  return (
    <label className="admin-language-switch">
      <span>{label}</span>
      <select value={value} onChange={changeLanguage} aria-label={label}>
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </label>
  );
}
