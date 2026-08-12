import type { Metadata } from "next"

import { BoardBucketView } from "@/components/board/board-bucket-view"

export const metadata: Metadata = {
  title: "Trash",
}

export default async function BoardTrashRoute({
  params,
}: {
  params: Promise<{ boardSlug: string }>
}) {
  const { boardSlug } = await params

  return <BoardBucketView slug={boardSlug} bucket="trash" />
}
