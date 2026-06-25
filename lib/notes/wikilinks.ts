const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

export function extractWikilinkTitles(content: string): string[] {
  const titles = new Set<string>();
  let match: RegExpExecArray | null;
  WIKILINK_RE.lastIndex = 0;
  while ((match = WIKILINK_RE.exec(content)) !== null) {
    const raw = match[1].split("|")[0].trim();
    if (raw) titles.add(raw);
  }
  return Array.from(titles);
}

export function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

export function contentLinksTo(content: string, targetTitle: string): boolean {
  const target = normalizeTitle(targetTitle);
  return extractWikilinkTitles(content).some(
    (t) => normalizeTitle(t) === target
  );
}
