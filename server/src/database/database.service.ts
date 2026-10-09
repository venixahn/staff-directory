import { Inject, Injectable, type OnModuleInit } from "@nestjs/common"
import { createSeedDatabase, databaseSchema, type StaffDatabase } from "@staff/shared"
import { Effect, type Semaphore } from "effect"
import { JSONFilePreset, type Low } from "lowdb/node"
import { mkdir } from "node:fs/promises"
import path from "node:path"
import { DatabaseFailure, type InvalidField, invalidField } from "../errors"
import { DB_PATH } from "./db-path"

@Injectable()
export class DatabaseService implements OnModuleInit {
  private low: Low<StaffDatabase> | null = null
  private gate: Semaphore | null = null

  constructor(@Inject(DB_PATH) private readonly dbPath: string) {}

  async onModuleInit() {
    await mkdir(path.dirname(this.dbPath), { recursive: true })
    const low = await JSONFilePreset(this.dbPath, createSeedDatabase())
    const parsed = databaseSchema.safeParse(low.data)
    if (!parsed.success) throw new Error("The staff database file is invalid")
    low.data = parsed.data
    this.low = low
    this.gate = Effect.runSync(Effect.makeSemaphore(1))
  }

  read(): Effect.Effect<StaffDatabase, DatabaseFailure> {
    const low = this.low
    return this.locked(Effect.sync(() => cloneData(low)))
  }

  transaction<A, E>(
    body: (data: StaffDatabase) => Effect.Effect<{ data: StaffDatabase; value: A }, E>,
  ): Effect.Effect<A, E | DatabaseFailure | InvalidField> {
    const low = this.low
    return this.locked(writeNext(low, body))
  }

  private locked<A, E>(effect: Effect.Effect<A, E>): Effect.Effect<A, E | DatabaseFailure> {
    const gate = this.gate
    if (!gate) return Effect.fail(new DatabaseFailure({ message: "Database is closed" }))
    return gate.withPermits(1)(effect)
  }
}

function cloneData(low: Low<StaffDatabase> | null): StaffDatabase {
  if (!low) throw new Error("Database is closed")
  return structuredClone(low.data)
}

function writeNext<A, E>(
  low: Low<StaffDatabase> | null,
  body: (data: StaffDatabase) => Effect.Effect<{ data: StaffDatabase; value: A }, E>,
): Effect.Effect<A, E | DatabaseFailure | InvalidField> {
  if (!low) return Effect.fail(new DatabaseFailure({ message: "Database is closed" }))
  return Effect.gen(function* () {
    const next = yield* body(structuredClone(low.data))
    const parsed = databaseSchema.safeParse(next.data)
    if (!parsed.success) return yield* Effect.fail(invalidField("Database shape is invalid"))
    low.data = parsed.data
    yield* Effect.tryPromise({
      try: () => low.write(),
      catch: () => new DatabaseFailure({ message: "Could not write the database" }),
    })
    return next.value
  })
}
