import { Data } from "effect"

export class EmployeeNotFound extends Data.TaggedError("EmployeeNotFound")<{
  readonly message: string
}> {}

export class FieldNotFound extends Data.TaggedError("FieldNotFound")<{
  readonly message: string
}> {}

export class BuiltinFieldProtected extends Data.TaggedError("BuiltinFieldProtected")<{
  readonly message: string
}> {}

export class InvalidField extends Data.TaggedError("InvalidField")<{
  readonly message: string
}> {}

export class DatabaseFailure extends Data.TaggedError("DatabaseFailure")<{
  readonly message: string
}> {}

export const employeeNotFound = (id: string) =>
  new EmployeeNotFound({ message: `Employee ${id} was not found` })

export const fieldNotFound = (id: string) => new FieldNotFound({ message: `Field ${id} was not found` })

export const builtinFieldProtected = (id: string) =>
  new BuiltinFieldProtected({ message: `Field ${id} is built in and cannot be removed` })

export const invalidField = (message: string) => new InvalidField({ message })
