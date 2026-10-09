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
  {
    id: "education",
    label: "Education",
    type: "records",
    required: false,
    builtin: false,
    columns: [
      { id: "school", label: "School", type: "text" },
      { id: "degree", label: "Degree", type: "text" },
      { id: "location", label: "Location", type: "text" },
      { id: "from", label: "From", type: "date" },
      { id: "to", label: "To", type: "date" },
    ],
  },
  {
    id: "employment",
    label: "Employment history",
    type: "records",
    required: false,
    builtin: false,
    columns: [
      { id: "employer", label: "Employer", type: "text" },
      { id: "role", label: "Role", type: "text" },
      { id: "location", label: "Location", type: "text" },
      { id: "from", label: "From", type: "date" },
      { id: "to", label: "To", type: "date" },
    ],
  },
  {
    id: "family",
    label: "Family members",
    type: "records",
    required: false,
    builtin: false,
    columns: [
      { id: "name", label: "Name", type: "text" },
      { id: "relationship", label: "Relationship", type: "text" },
      { id: "birthDate", label: "Birth date", type: "date" },
    ],
  },
]

const histories: Record<string, Employee["values"]> = {
  "emp-ada": {
    education: [{ school: "Home tutoring", degree: "Mathematics", location: "London", from: "1830-01-01", to: "1835-12-31" }],
    employment: [{ employer: "Analytical Engine project", role: "Analyst", location: "London", from: "1842-01-01", to: "1843-12-31" }],
    family: [{ name: "Byron King", relationship: "Child", birthDate: "1836-05-12" }],
  },
  "emp-grace": {
    education: [
      { school: "Vassar College", degree: "BA Mathematics", location: "Poughkeepsie", from: "1924-09-01", to: "1928-06-01" },
      { school: "Yale University", degree: "PhD Mathematics", location: "New Haven", from: "1930-09-01", to: "1934-06-01" },
    ],
    employment: [{ employer: "US Navy", role: "Officer", location: "Washington", from: "1943-12-01", to: "1986-08-14" }],
  },
}

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
      education: [],
      employment: [],
      family: [],
      ...histories[id],
    },
  }
}
