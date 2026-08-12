import { z } from "zod"

import { emptyResponseSchema, request } from "@/lib/api/client"
import {
  boardDetailSchema,
  boardSummarySchema,
  boardUpdateResponseSchema,
} from "@/lib/api/types"
import type {
  BoardDetail,
  BoardSummary,
  BoardUpdateResponse,
} from "@/lib/api/types"

export type BoardCreatePayload = {
  title: string
  members: number[]
}

export type BoardUpdatePayload = {
  title?: string
  members?: number[]
}

export function listBoards(): Promise<BoardSummary[]> {
  return request("/boards/", z.array(boardSummarySchema))
}

export function createBoard(payload: BoardCreatePayload): Promise<BoardSummary> {
  return request("/boards/", boardSummarySchema, {
    method: "POST",
    body: payload,
  })
}

export function getBoard(boardId: number): Promise<BoardDetail> {
  return request(`/boards/${boardId}/`, boardDetailSchema)
}

export function updateBoard(
  boardId: number,
  payload: BoardUpdatePayload
): Promise<BoardUpdateResponse> {
  return request(`/boards/${boardId}/`, boardUpdateResponseSchema, {
    method: "PATCH",
    body: payload,
  })
}

export function deleteBoard(boardId: number): Promise<void> {
  return request(`/boards/${boardId}/`, emptyResponseSchema, {
    method: "DELETE",
  })
}
