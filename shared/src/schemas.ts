import { z } from "zod"

export const fieldTypeSchema = z.enum([
  "text",
  "textarea",
  "email",
  "phone",
  "date",
  "select",
])

export const fieldSchema = z
  .object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    type: fieldTypeSchema,
    required: z.boolean(),
    options: z.array(z.string().trim().min(1)).optional(),
    builtin: z.boolean(),
  })
  .superRefine(requireSelectOptions)

export const fieldDraftSchema = z
  .object({
    label: z.string().trim().min(1),
    type: fieldTypeSchema,
    required: z.boolean(),
    options: z.array(z.string().trim().min(1)).optional(),
  })
  .superRefine(requireSelectOptions)

export const employeeSchema = z.object({
  id: z.string().trim().min(1),
  values: z.record(z.string(), z.string()),
})

export const employeeBodySchema = z.object({
  values: z.record(z.string(), z.string()),
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

function requireSelectOptions(
  field: { type: FieldType; options?: string[] },
  ctx: z.RefinementCtx,
) {
  if (field.type !== "select") return
  if (field.options && field.options.length > 0) return
  ctx.addIssue({
    code: "custom",
    message: "Select fields need options",
    path: ["options"],
  })
}
