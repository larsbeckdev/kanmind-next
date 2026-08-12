import type { Metadata } from "next"

import { BoardBucketView } from "@/components/board/board-bucket-view"

export const metadata: Metadata = {
  title: "Archive",
}

export default async function BoardArchiveRoute({
  params,
}: {
  params: Promise<{ boardSlug: string }>
}) {
  const { boardSlug } = await params

  return <BoardBucketView slug={boardSlug} bucket="archive" />
}
