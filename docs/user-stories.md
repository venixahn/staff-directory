# User stories

Scenarios use Given / When / Then. Playwright covers each story.

## Add an employee

Given the directory is open  
When I add an employee with first name, last name, and email  
Then their profile opens, and the directory lists that person

## Open a profile

Given the directory is open  
When I click an employee row  
Then their profile opens with Edit, Download PDF, and Delete

## Edit an employee

Given an employee's profile is open  
When I click Edit, change their job title, and save  
Then the profile and the directory show the new job title

## Delete an employee

Given an employee's profile is open  
When I click Delete  
Then a dialog asks me to type their full name, and Delete stays disabled until the name matches  
When I cancel  
Then the profile is unchanged  
When I type the name and confirm  
Then the directory no longer lists that person

## Search the directory

Given several employees exist  
When I type a department name  
Then only employees in that department remain visible

## Add a custom field

Given the fields page is open  
When I add a text field called Nickname  
Then the employee form shows Nickname

## Reorder fields

Given the fields page is open  
When I drag Office onto Phone  
Then Office takes Phone's place, and the order is still there after a reload

## Delete a custom field

Given an employee has a Nickname  
When I delete the Nickname field and type "Nickname" to confirm  
Then the form no longer shows it and the stored value is gone

## Download a profile PDF

Given an employee's profile is open  
When I click Download PDF  
Then the profile PDF designer opens with a preview of their page  
When I click Download PDF there  
Then the browser receives a PDF file

## Design the profile PDF on the page

Given the profile PDF designer is open  
When I drag Office onto First name  
Then Office moves to the top of the page  
When I hover Email and press ×  
Then Email leaves the page and a "+ Email" chip appears  
When I click "+ Email"  
Then Email is back on the page  
When I choose two columns and then Reset  
Then the page shows the saved layout again

## Save the profile layout

Given the profile PDF designer is open  
When I rename the title, put labels above values, and save as the default layout  
Then another employee's designer opens with that title and label style

## Download an aggregate PDF

Given the report search is "Research"  
When I download the report  
Then the browser receives a PDF of that search

## Save the report layout

Given the Report PDF page is open  
When I rename the title, change sort and group-by, add the Phone column, and save as the default layout  
Then those choices are still there after a reload
