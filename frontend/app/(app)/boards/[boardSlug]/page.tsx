import type { Metadata } from "next"

import { BoardPage } from "@/components/board/board-page"

export const metadata: Metadata = {
  title: "Board",
}

export default async function BoardRoute({
  params,
}: {
  params: Promise<{ boardSlug: string }>
}) {
  const { boardSlug } = await params

  return <BoardPage slug={boardSlug} />
}
