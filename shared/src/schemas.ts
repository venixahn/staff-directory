import { z } from "zod"

export const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "email",
  "phone",
  "date",
  "select",
  "records",
])

export const recordColumnTypeSchema = z.enum(["text", "date"])

export const recordColumnSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  type: recordColumnTypeSchema,
})

export const recordColumnDraftSchema = recordColumnSchema.extend({
  id: z.string().trim().min(1).optional(),
})

export const fieldSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    type: fieldTypeSchema,
    required: z.boolean(),
    options: z.array(z.string().trim().min(1)).optional(),
    columns: z.array(recordColumnSchema).optional(),
    builtin: z.boolean(),
  })
  .superRefine(checkTypeDetails)

export const fieldDraftSchema = z
  .object({
    label: z.string().trim().min(1),
    type: fieldTypeSchema,
    required: z.boolean(),
    options: z.array(z.string().trim().min(1)).optional(),
    columns: z.array(recordColumnDraftSchema).optional(),
  })
  .superRefine(checkTypeDetails)

export const recordEntrySchema = z.record(z.string(), z.string())
export const fieldValueSchema = z.union([z.string(), z.array(recordEntrySchema)])
export const employeeValuesSchema = z.record(z.string(), fieldValueSchema)

export const employeeSchema = z.object({
  id: z.string().trim().min(1),
  values: employeeValuesSchema,
})

export const employeeBodySchema = z.object({
  values: employeeValuesSchema,
})

export const orientationSchema = z.enum(["portrait", "landscape"])
export const pageSizeSchema = z.enum(["A4", "LETTER"])
export const marginSchema = z.enum(["narrow", "normal", "wide"])
export const labelStyleSchema = z.enum(["inline", "stacked"])
export const densitySchema = z.enum(["compact", "comfortable"])

export const profileLayoutSchema = z.object({
  title: z.string().trim().min(1),
  fieldIds: z.array(z.string()),
  showEmptyFields: z.boolean(),
  orientation: orientationSchema,
  pageSize: pageSizeSchema.default("A4"),
  margin: marginSchema.default("normal"),
  columns: z.union([z.literal(1), z.literal(2)]).default(1),
  labelStyle: labelStyleSchema.default("inline"),
  titleSize: z.number().int().min(12).max(28).default(18),
  bodySize: z.number().int().min(8).max(16).default(11),
})

export const reportLayoutSchema = z.object({
  title: z.string().trim().min(1),
  columnIds: z.array(z.string()),
  orientation: orientationSchema,
  sortFieldId: z.string().min(1),
  sortDirection: z.enum(["asc", "desc"]),
  groupByFieldId: z.string().nullable(),
  pageSize: pageSizeSchema.default("A4"),
  margin: marginSchema.default("normal"),
  titleSize: z.number().int().min(12).max(28).default(16),
  bodySize: z.number().int().min(8).max(14).default(9),
  density: densitySchema.default("comfortable"),
})

export const profilePdfRequestSchema = z.object({ layout: profileLayoutSchema.optional() })
export const reportPdfRequestSchema = z.object({ layout: reportLayoutSchema.optional() })

export const fieldOrderSchema = z.object({
  ids: z.array(z.string().min(1)),
})

export const databaseSchema = z.object({
  fields: z.array(fieldSchema),
  employees: z.array(employeeSchema),
  layouts: z.object({
    profile: profileLayoutSchema,
    report: reportLayoutSchema,
  }),
})

export const builtinFieldIds = ["firstName", "lastName", "email"] as const

export type FieldType = z.infer<typeof fieldTypeSchema>
export type RecordColumnType = z.infer<typeof recordColumnTypeSchema>
export type RecordColumn = z.infer<typeof recordColumnSchema>
export type RecordColumnDraft = z.infer<typeof recordColumnDraftSchema>
export type RecordEntry = z.infer<typeof recordEntrySchema>
export type FieldValue = z.infer<typeof fieldValueSchema>
export type EmployeeValues = z.infer<typeof employeeValuesSchema>
export type Field = z.infer<typeof fieldSchema>
export type FieldDraft = z.infer<typeof fieldDraftSchema>
export type Employee = z.infer<typeof employeeSchema>
export type EmployeeBody = z.infer<typeof employeeBodySchema>
export type PageSize = z.infer<typeof pageSizeSchema>
export type Margin = z.infer<typeof marginSchema>
export type LabelStyle = z.infer<typeof labelStyleSchema>
export type Density = z.infer<typeof densitySchema>
export type ProfileLayout = z.infer<typeof profileLayoutSchema>
export type ReportLayout = z.infer<typeof reportLayoutSchema>
export type StaffDatabase = z.infer<typeof databaseSchema>

function checkTypeDetails(
  field: { type: FieldType; options?: string[]; columns?: unknown[] },
  ctx: z.RefinementCtx,
) {
  if (field.type === "select" && !field.options?.length) {
    ctx.addIssue({ code: "custom", message: "Select fields need options", path: ["options"] })
  }
  if (field.type === "records" && !field.columns?.length) {
    ctx.addIssue({ code: "custom", message: "Records fields need at least one column", path: ["columns"] })
  }
}
