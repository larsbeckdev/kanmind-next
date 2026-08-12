/**
 * Board URLs are built from the title alone: /boards/website-relaunch.
 *
 * The API offers no lookup by slug, so the id behind a slug is resolved on
 * the client against GET /api/boards/ - the list the overview loads anyway.
 * A numeric segment still resolves directly, which keeps older links and the
 * dashboard table working, where only the board id is known.
 */

const MAX_SLUG_LENGTH = 60
const COMBINING_MARKS = /[̀-ͯ]/g

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "")
}

export function boardHref(board: { id: number; title: string }): string {
  const slug = slugify(board.title)
  return `/boards/${slug || board.id}`
}

type SlugCandidate = { id: number; title: string }

/**
 * Resolves a URL segment to a board id.
 *
 * Two boards can carry the same title and therefore the same slug. Without a
 * server side registry there is nothing to tell them apart, so the lowest id
 * wins and stays the same on every visit.
 */
export function findBoardBySlug<T extends SlugCandidate>(
  boards: readonly T[],
  segment: string
): T | null {
  const numeric = /^\d+$/.test(segment) ? Number(segment) : null
  if (numeric !== null) {
    return boards.find((board) => board.id === numeric) ?? null
  }

  const matches = boards
    .filter((board) => slugify(board.title) === segment)
    .sort((a, b) => a.id - b.id)
  return matches[0] ?? null
}
