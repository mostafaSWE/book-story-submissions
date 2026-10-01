// Copy for the shared admin screens added for multiple books (overview, «أنت الكاتب» pages).
// Kept here, not in src/lib/i18n.js, so the public site's translation file stays untouched.
// Existing strings still come from getAdminCopy() in src/lib/i18n.js.
const en = {
  books: "Books",
  booksIntro: "Each book has its own entries, list and export. They never mix.",
  bookLabel: "Book",
  site: "Site",
  table: "Table",
  total: "Total",
  lastWeek: "Last 7 days",
  latest: "Latest entries",
  allEntries: "All entries",
  exportCsv: "Export CSV",
  exportSelected: "Export selected",
  noEntries: "No entries yet.",
  unavailable: "Couldn't load this book's numbers right now.",
  entries: "Entries",
  searchPlaceholder: "Name, email, phone, title or text",
  status: "Status",
  allStatuses: "All statuses",
  statusNames: { new: "New", shortlisted: "Shortlisted", selected: "Selected" },
  title: "Title",
  text: "Text",
  reference: "Reference",
  noTitle: "No title",
  contribution: "Contribution",
  contributor: "Contributor",
  curation: "Curation",
  moveTo: "Set status",
  note: "Private note",
  noteHint: "Only visible in this admin.",
  saveNote: "Save note",
  saved: "Saved.",
  consent: "Publication consent",
  consentGiven: "Given (wording {version})",
  consentMissing: "Not given",
  sentFrom: "Sent from",
  statusChanged: "Status changed",
  updated: "Updated",
  backToList: "All entries",
  view: "View"
};

const ar = {
  books: "الكتب",
  booksIntro: "لكل كتابٍ مشاركاته وقائمته وتصديره، ولا تختلط أبدًا.",
  bookLabel: "الكتاب",
  site: "الموقع",
  table: "الجدول",
  total: "الإجمالي",
  lastWeek: "آخر 7 أيام",
  latest: "أحدث المشاركات",
  allEntries: "كل المشاركات",
  exportCsv: "تصدير CSV",
  exportSelected: "تصدير المختارة",
  noEntries: "لا توجد مشاركات بعد.",
  unavailable: "تعذّر تحميل أرقام هذا الكتاب الآن.",
  entries: "المشاركات",
  searchPlaceholder: "الاسم، البريد، الهاتف، العنوان أو النص",
  status: "الحالة",
  allStatuses: "كل الحالات",
  statusNames: { new: "جديدة", shortlisted: "في القائمة القصيرة", selected: "مختارة" },
  title: "العنوان",
  text: "النص",
  reference: "المرجع",
  noTitle: "بلا عنوان",
  contribution: "المشاركة",
  contributor: "الكاتب",
  curation: "الاختيار",
  moveTo: "تغيير الحالة",
  note: "ملاحظة خاصة",
  noteHint: "تظهر في لوحة الإدارة فقط.",
  saveNote: "حفظ الملاحظة",
  saved: "تم الحفظ.",
  consent: "الموافقة على النشر",
  consentGiven: "أُعطيت (صيغة {version})",
  consentMissing: "لم تُعطَ",
  sentFrom: "أُرسلت من",
  statusChanged: "تغيّرت الحالة",
  updated: "آخر تحديث",
  backToList: "كل المشاركات",
  view: "عرض"
};

export function getBooksCopy(adminLang) {
  return adminLang === "ar" ? ar : en;
}

export function fill(text, vars) {
  return String(text).replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ""));
}
