"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AdminLanguageSwitch({ value, label }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeLanguage(event) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("adminLang", event.target.value === "ar" ? "ar" : "en");
    params.delete("saved");
    // Stay on the current admin page (overview, a book's list, or a detail page).
    router.push(`${pathname || "/admin"}?${params.toString()}`);
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
