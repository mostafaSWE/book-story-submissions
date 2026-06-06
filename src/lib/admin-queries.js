export function buildSubmissionWhere(searchParams = {}) {
  const q = String(searchParams.q || "").trim();
  const country = String(searchParams.country || "").trim();
  const language = String(searchParams.language || "").trim();
  const dateFrom = String(searchParams.dateFrom || "").trim();
  const dateTo = String(searchParams.dateTo || "").trim();
  const and = [];

  if (q) {
    and.push({
      OR: [
        { fullName: { contains: q } },
        { phoneNumber: { contains: q } },
        { email: { contains: q } },
        { country: { contains: q } },
        { countryCode: { contains: q.toUpperCase() } },
        { selectedLanguage: { contains: q } },
        { storyText: { contains: q } }
      ]
    });
  }

  if (country) {
    and.push({
      OR: [{ country: { contains: country } }, { countryCode: { contains: country.toUpperCase() } }]
    });
  }

  if (language) {
    and.push({ selectedLanguage: language });
  }

  if (dateFrom || dateTo) {
    const createdAt = {};
    if (dateFrom) createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
    if (dateTo) createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
    and.push({ createdAt });
  }

  return and.length ? { AND: and } : {};
}

function normalizeFilterValue(value) {
  return String(value || "")
    .trim()
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ");
}

function ilikeClause(column, value) {
  return `${column}.ilike.%${normalizeFilterValue(value)}%`;
}

export function applySubmissionFilters(query, searchParams = {}) {
  const q = normalizeFilterValue(searchParams.q);
  const country = normalizeFilterValue(searchParams.country);
  const language = String(searchParams.language || "").trim();
  const dateFrom = String(searchParams.dateFrom || "").trim();
  const dateTo = String(searchParams.dateTo || "").trim();
  let nextQuery = query;

  if (q) {
    nextQuery = nextQuery.or(
      [
        ilikeClause("full_name", q),
        ilikeClause("phone_number", q),
        ilikeClause("email", q),
        ilikeClause("country", q),
        ilikeClause("country_code", q.toUpperCase()),
        ilikeClause("selected_language", q),
        ilikeClause("story_text", q)
      ].join(",")
    );
  }

  if (country) {
    nextQuery = nextQuery.or([ilikeClause("country", country), ilikeClause("country_code", country.toUpperCase())].join(","));
  }

  if (language) {
    nextQuery = nextQuery.eq("selected_language", language);
  }

  if (dateFrom) {
    nextQuery = nextQuery.gte("created_at", new Date(`${dateFrom}T00:00:00.000Z`).toISOString());
  }

  if (dateTo) {
    nextQuery = nextQuery.lte("created_at", new Date(`${dateTo}T23:59:59.999Z`).toISOString());
  }

  return nextQuery;
}

export function searchParamsToQueryString(searchParams = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }

  return params.toString();
}

export function escapeCsv(value) {
  const normalized = String(value ?? "").replace(/\r?\n/g, " ");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}
