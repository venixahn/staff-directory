import type { Employee, Field, StaffDatabase } from "./schemas"

const fields: Field[] = [
  { id: "firstName", label: "First name", type: "text", required: true, builtin: true },
  { id: "lastName", label: "Last name", type: "text", required: true, builtin: true },
  { id: "email", label: "Email", type: "email", required: true, builtin: true },
  { id: "phone", label: "Phone", type: "phone", required: false, builtin: false },
  { id: "department", label: "Department", type: "text", required: false, builtin: false },
  { id: "jobTitle", label: "Job title", type: "text", required: false, builtin: false },
  { id: "hireDate", label: "Hire date", type: "date", required: false, builtin: false },
  {
    id: "status",
    label: "Status",
    type: "select",
    required: true,
    options: ["Active", "Inactive"],
    builtin: false,
  },
  { id: "office", label: "Office", type: "text", required: false, builtin: false },
]

const fieldIds = fields.map((field) => field.id)

export function createSeedDatabase(): StaffDatabase {
  return {
    fields,
    employees: sampleEmployees(),
    layouts: {
      profile: {
        title: "Employee Profile",
        fieldIds: [...fieldIds],
        showEmptyFields: false,
        orientation: "portrait",
        pageSize: "A4",
        margin: "normal",
        columns: 1,
        labelStyle: "inline",
        titleSize: 18,
        bodySize: 11,
      },
      report: {
        title: "Employee Directory",
        columnIds: ["firstName", "lastName", "email", "department", "jobTitle", "status"],
        orientation: "landscape",
        sortFieldId: "lastName",
        sortDirection: "asc",
        groupByFieldId: "department",
        pageSize: "A4",
        margin: "normal",
        titleSize: 16,
        bodySize: 9,
        density: "comfortable",
      },
    },
  }
}

function sampleEmployees(): Employee[] {
  return [
    person("emp-ada", "Ada", "Lovelace", "ada@example.com", "Engineering", "Engineer", "Active", "London"),
    person("emp-grace", "Grace", "Hopper", "grace@example.com", "Engineering", "Admiral", "Active", "New York"),
    person("emp-alan", "Alan", "Turing", "alan@example.com", "Research", "Scientist", "Active", "Manchester"),
    person("emp-katherine", "Katherine", "Johnson", "katherine@example.com", "Research", "Mathematician", "Active", "Hampton"),
    person("emp-margaret", "Margaret", "Hamilton", "margaret@example.com", "Engineering", "Director", "Active", "Cambridge"),
    person("emp-tim", "Tim", "Berners-Lee", "tim@example.com", "Product", "Inventor", "Active", "London"),
    person("emp-barbara", "Barbara", "Liskov", "barbara@example.com", "Research", "Professor", "Inactive", "Boston"),
    person("emp-donald", "Donald", "Knuth", "donald@example.com", "Research", "Professor", "Active", "Stanford"),
  ]
}

function person(
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  department: string,
  jobTitle: string,
  status: string,
  office: string,
): Employee {
  return {
    id,
    values: {
      firstName,
      lastName,
      email,
      phone: "",
      department,
      jobTitle,
      hireDate: "2020-01-15",
      status,
      office,
    },
  }
}
