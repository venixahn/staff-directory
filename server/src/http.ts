import { BadRequestException, HttpException, InternalServerErrorException } from "@nestjs/common"
import { Effect } from "effect"
import type { ZodType } from "zod"

const statusByTag: Record<string, number> = {
  EmployeeNotFound: 404,
  FieldNotFound: 404,
  BuiltinFieldProtected: 409,
  InvalidField: 400,
  DatabaseFailure: 500,
}

export async function runEffect<A, E extends { _tag: string; message?: string }>(
  effect: Effect.Effect<A, E>,
): Promise<A> {
  const result = await Effect.runPromise(Effect.either(effect))
  if (result._tag === "Left") throw toHttpException(result.left)
  return result.right
}

export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (result.success) return result.data
  throw new BadRequestException(result.error.issues[0]?.message ?? "Request body is invalid")
}

function toHttpException(error: { _tag: string; message?: string }) {
  const status = statusByTag[error._tag] ?? 500
  const message = error.message ?? error._tag
  if (status >= 500) return new InternalServerErrorException(message)
  return new HttpException(message, status)
}
