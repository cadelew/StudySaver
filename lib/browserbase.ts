import {
  getKnownSchoolDealSources,
  getSchoolSearchQueries,
} from "./school-deal-sources";

export interface BrowserbaseSearchResult {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishedDate?: string;
}

export interface BrowserbaseFetchOptions {
  url: string;
  format?: "raw" | "markdown" | "json";
  schema?: Record<string, unknown>;
  allowRedirects?: boolean;
  allowInsecureSsl?: boolean;
  proxies?: boolean;
}

export interface BrowserbaseFetchResponse {
  ok: boolean;
  statusCode: number;
  content: string;
  contentType?: string;
  error?: string;
}

const FETCH_TIMEOUT_MS = 30000;
const MAX_MARKDOWN_CHARS = 1800;

export function isBrowserbaseConfigured(): boolean {
  return Boolean(process.env.BROWSERBASE_API_KEY);
}

export async function browserbaseSearch(
  query: string,
  numResults = 5
): Promise<BrowserbaseSearchResult[]> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://api.browserbase.com/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-bb-api-key": apiKey,
    },
    body: JSON.stringify({ query: query.slice(0, 200), numResults }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Browserbase search failed (${res.status}):`, body);
    return [];
  }

  const data = (await res.json()) as { results?: BrowserbaseSearchResult[] };
  return data.results ?? [];
}

/** Fetch page content via Browserbase (no JS execution; 5 MB limit; no PDF markdown). */
export async function browserbaseFetch(
  options: BrowserbaseFetchOptions
): Promise<BrowserbaseFetchResponse> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  if (!apiKey) {
    return { ok: false, statusCode: 0, content: "", error: "No API key" };
  }

  const { url, format = "markdown", schema, allowRedirects = true, allowInsecureSsl, proxies } = options;

  if (url.toLowerCase().endsWith(".pdf")) {
    return { ok: false, statusCode: 0, content: "", error: "PDF not supported by Fetch" };
  }

  const body: Record<string, unknown> = { url, format, allowRedirects };
  if (schema && format === "json") body.schema = schema;
  if (allowInsecureSsl) body.allowInsecureSsl = true;
  if (proxies) body.proxies = true;

  const attempt = async (useProxies: boolean) => {
    const payload = useProxies ? { ...body, proxies: true } : body;
    const res = await fetch("https://api.browserbase.com/v1/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bb-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({})) as { message?: string; statusCode?: number };
      return {
        ok: false,
        statusCode: errBody.statusCode ?? res.status,
        content: "",
        error: errBody.message ?? res.statusText,
      };
    }

    const data = (await res.json()) as {
      statusCode: number;
      content: string | Record<string, unknown>;
      contentType?: string;
    };

    const content =
      typeof data.content === "string"
        ? data.content
        : JSON.stringify(data.content);

    return {
      ok: data.statusCode >= 200 && data.statusCode < 400,
      statusCode: data.statusCode,
      content,
      contentType: data.contentType,
    };
  };

  let result = await attempt(Boolean(proxies));

  if (!result.ok && result.statusCode === 403 && !proxies) {
    result = await attempt(true);
  }

  return result;
}

function truncateMarkdown(text: string, max = MAX_MARKDOWN_CHARS): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max) + "...";
}

/** Search, then fetch markdown from the top result(s) for richer LLM context. */
async function searchAndEnrich(
  label: string,
  query: string,
  fetchCount = 1
): Promise<string[]> {
  const results = await browserbaseSearch(query, 4);
  const lines: string[] = results.map((r) => `[${label}] ${r.title} - ${r.url}`);

  if (!isBrowserbaseConfigured() || fetchCount === 0) return lines;

  const toFetch = results.slice(0, fetchCount);
  const fetched = await Promise.all(
    toFetch.map(async (r) => {
      try {
        const page = await browserbaseFetch({ url: r.url, format: "markdown", allowRedirects: true });
        if (!page.ok || !page.content || page.content.length < 80) return null;
        return `[${label} page excerpt: ${r.title}]\n${truncateMarkdown(page.content)}`;
      } catch {
        return null;
      }
    })
  );

  lines.push(...fetched.filter((f): f is string => f !== null));
  return lines;
}

/** Fetch a single URL as markdown for pasted links (e.g. aid pages, deal pages). */
export async function fetchUrlForResearch(url: string): Promise<string> {
  if (!isBrowserbaseConfigured() || !url.trim()) return "";

  const page = await browserbaseFetch({ url: url.trim(), format: "markdown", allowRedirects: true });
  if (!page.ok || !page.content) return "";

  return `[Fetched: ${url}]\n${truncateMarkdown(page.content, 3000)}`;
}

export async function researchCourseMaterials(
  materials: Array<{
    id: string;
    title: string;
    edition?: string | null;
    isbn?: string | null;
    type: string;
    required: boolean;
  }>,
  school: string
): Promise<string> {
  if (!isBrowserbaseConfigured()) return "";

  const lines: string[] = [];
  const items = materials.slice(0, 4);

  for (const material of items) {
    const isbn = material.isbn ? ` ISBN ${material.isbn}` : "";
    const edition = material.edition ? ` ${material.edition} edition` : "";
    const base = `${material.title}${edition}${isbn}`;

    if (material.type === "access_code") {
      lines.push(
        ...(await searchAndEnrich(
          material.title,
          `${base} buy new access code official price`,
          1
        ))
      );
    } else if (material.type === "textbook" || material.type === "lab_manual") {
      const [rentals, library] = await Promise.all([
        searchAndEnrich(material.title, `${base} rent used textbook price Chegg Amazon`, 1),
        searchAndEnrich(material.title, `${base} ${school} library course reserve`, 1),
      ]);
      const oer = await searchAndEnrich(material.title, `${base} open educational resource free legal`, 0);
      lines.push(...rentals, ...library, ...oer);
    } else {
      lines.push(
        ...(await searchAndEnrich(
          material.title,
          `${base} ${school} student discount buy used`,
          1
        ))
      );
    }
  }

  return lines.slice(0, 35).join("\n\n");
}

export async function researchStudentDeals(
  school: string,
  major: string,
  subscriptions: string[]
): Promise<string> {
  if (!isBrowserbaseConfigured()) return "";

  const subList = subscriptions.length ? subscriptions.join(", ") : "Spotify, Notion";
  const sections: string[] = [];

  // 1. Direct-fetch known campus deal pages (e.g. Berkeley STS + UPP)
  const knownSources = getKnownSchoolDealSources(school);
  if (knownSources.length > 0) {
    const campusLines: string[] = [`[Campus-specific pages for ${school}]`];
    for (const source of knownSources) {
      campusLines.push(`[campus source] ${source.label} - ${source.url}`);
      try {
        const page = await browserbaseFetch({
          url: source.url,
          format: "markdown",
          allowRedirects: true,
        });
        if (page.ok && page.content && page.content.length > 80) {
          campusLines.push(
            `[campus page: ${source.label}]\n${truncateMarkdown(page.content, 2500)}`
          );
        }
      } catch {
        // fall through to search results only
      }
    }
    sections.push(campusLines.join("\n\n"));
  }

  // 2. School-specific web search + fetch
  if (school.trim()) {
    const schoolQueries = getSchoolSearchQueries(school);
    const schoolBatches = await Promise.all(
      schoolQueries.map((q) => searchAndEnrich("campus", q, 1))
    );
    if (schoolBatches.flat().length > 0) {
      sections.push(
        `[School-specific search: ${school}]\n${schoolBatches.flat().join("\n\n")}`
      );
    }
  }

  // 3. General student deals (not tied to one campus)
  const generalQueries = [
    `${major} student software free education plan`,
    `student discount ${subList} alternative free`,
    "GitHub Student Developer Pack eligibility",
    "Notion Spotify student discount education plan",
  ];
  const generalBatches = await Promise.all(
    generalQueries.map((q) => searchAndEnrich("general", q, 1))
  );
  sections.push(
    `[General student deals]\n${generalBatches.flat().join("\n\n")}`
  );

  return sections.join("\n\n---\n\n").slice(0, 12000);
}

/** Search for aid-related pages, then fetch markdown from top hits. */
export async function researchFinancialAid(
  school: string,
  queryContext?: string
): Promise<string> {
  if (!isBrowserbaseConfigured()) return "";

  const queries = [
    `${school} financial aid award letter net price calculator`,
    queryContext
      ? `${school} ${queryContext} financial aid appeal`
      : `${school} financial aid office contact`,
  ];

  const batches = await Promise.all(
    queries.map((q) => searchAndEnrich("aid", q, 2))
  );

  return batches.flat().slice(0, 20).join("\n\n");
}
