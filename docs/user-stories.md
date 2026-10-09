# User stories

Scenarios use Given / When / Then. Playwright covers each story.

## Add an employee

Given the directory is open  
When I add an employee with first name, last name, and email  
Then the directory lists that person

## Edit an employee

Given an employee exists  
When I change their job title and save  
Then the directory shows the new job title

## Delete an employee

Given an employee exists  
When I confirm delete  
Then the directory no longer lists that person

## Search the directory

Given several employees exist  
When I type a department name  
Then only employees in that department remain visible

## Add a custom field

Given the fields page is open  
When I add a text field called Nickname  
Then the employee form shows Nickname

## Delete a custom field

Given an employee has a Nickname  
When I delete the Nickname field  
Then the form no longer shows it and the stored value is gone

## Download a profile PDF

Given an employee exists  
When I download their profile  
Then the browser receives a PDF file

## Save the profile layout

Given the export page is open  
When I change the profile title and save  
Then the title is still there after a reload

## Download an aggregate PDF

Given the directory search is "Research"  
When I download the report  
Then the browser receives a PDF of that search

## Save the report layout

Given the export page is open  
When I change columns, sort, and group-by and save  
Then those choices are still there after a reload
