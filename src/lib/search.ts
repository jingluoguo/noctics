import type { TravelContentItem, WritingContentItem } from './content';
import type { WorkItem } from '../site.config';

type Searchable = {
  title: string;
  summary: string;
  tags: string[];
};

function normalize(input: string) {
  return input.trim().toLowerCase();
}

function tokenize(input: string) {
  return normalize(input).split(/\s+/).filter(Boolean);
}

function includesTerm(target: Searchable, term: string) {
  const tagText = target.tags.join(' ').toLowerCase();
  return (
    target.title.toLowerCase().includes(term) ||
    target.summary.toLowerCase().includes(term) ||
    tagText.includes(term)
  );
}

export function matchesKeyword(target: Searchable, keyword: string) {
  const terms = tokenize(keyword);
  if (!terms.length) return true;
  return terms.every((term) => includesTerm(target, term));
}

export function filterWritingByKeyword(items: WritingContentItem[], keyword: string) {
  const normalized = normalize(keyword);
  if (!normalized) return items;
  return items.filter((item) =>
    matchesKeyword(
      {
        title: item.title,
        summary: item.summary,
        tags: item.tags
      },
      normalized
    )
  );
}

export function filterTravelByKeyword(items: TravelContentItem[], keyword: string) {
  const normalized = normalize(keyword);
  if (!normalized) return items;
  return items.filter((item) =>
    matchesKeyword(
      {
        title: item.city,
        summary: item.summary,
        tags: item.tags
      },
      normalized
    )
  );
}

export function filterWorkByKeyword(items: WorkItem[], keyword: string) {
  const normalized = normalize(keyword);
  if (!normalized) return items;
  return items.filter((item) =>
    matchesKeyword(
      {
        title: item.name,
        summary: [item.desc, item.stack, item.platforms?.map((platform) => platform.name).join(' ') ?? '']
          .filter(Boolean)
          .join(' '),
        tags: []
      },
      normalized
    )
  );
}
