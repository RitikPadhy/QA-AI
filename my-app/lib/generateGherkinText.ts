export const generateGherkinText = (
        scenarios: Record<string, string[]>,
        flow: string,
        type: string,
        testCase: string  // The selected test case
      ) => {
        let gherkinOutput = "";
      
        // Define the templates for each type of test case
        const template: Record<string, string> = {
          "Positive Test Cases": `Given the user is authenticated and successfully navigates to the ${flow} page
And all required fields are visible and enabled
When the user enters valid data into all mandatory fields
And clicks the "Submit" button
Then the system should validate the input
And create the corresponding record in the backend
And display a confirmation message "Operation completed successfully"
And redirect the user to the appropriate success screen or dashboard`,

        "Negative Test Cases": `Given the user is on the ${flow} page without completing prior prerequisites
Or the user enters invalid or malformed data (e.g., missing fields, wrong format)
When they attempt to submit the form or trigger an operation
Then the system should block the action
And highlight the invalid fields with validation messages
And show an error banner saying "Please correct the highlighted errors"
And log the invalid attempt in the system logs`,

    "Data-Related Test Cases": `Given the user is on the ${flow} module which handles structured data inputs
And the dataset includes edge-case values such as maximum length strings, nulls, and special characters
When the user submits this data through the upload or form interface
Then the system should sanitize and validate the data
And either accept it or provide contextual error messages
And ensure that no data corruption or crash occurs during processing
And log the validation outcome appropriately`,

    "UI/UX Test Cases": `Given the user accesses the ${flow} interface on a standard screen resolution and supported browser
And the UI has fully loaded
When the user interacts with interactive elements such as buttons, checkboxes, modals, and tooltips
Then all components should follow the defined design system (spacing, colors, font, responsiveness)
And transitions/animations (if any) should feel smooth and non-blocking
And accessibility features such as keyboard navigation and screen-reader tags should work as expected
And no layout should break on smaller or larger screen sizes`,

    "Functional Test Cases": `Given the ${flow} module is integrated with the required backend services and APIs
And the user has the correct permissions to perform the task
When the user performs the core functional action — such as submitting a form, triggering a workflow, or generating output
Then the system should process the input
And invoke any required APIs with valid payloads
And update the system state accordingly
And reflect those changes on the UI without requiring a manual refresh
And handle failures gracefully with retry logic or appropriate error messages`,

    "Compliance Test Cases": `Given the ${flow} module deals with regulated information (e.g., PII, financial data, legal docs)
And a regulatory rule (like GDPR, HIPAA, or internal audit policy) applies to the data being handled
When a user uploads, edits, or submits such data
Then the system should apply compliance checks such as encryption, masking, or audit logging
And prevent actions that violate the policy
And show a descriptive error or warning (e.g., "File must be digitally signed before upload")
And log the attempt in the audit trail for review by compliance teams`,

    "Smoke/Sanity": `Given the application environment is up and running
And the user can log in successfully and reach the ${flow} module
When the user performs a basic but essential workflow like clicking a key button or submitting a minimal form
Then all UI components should be visible and usable
And no unhandled exceptions or console errors should occur
And the backend service should respond with a 2xx status
And the operation should complete without requiring any retry or manual intervention`,
        };
      
        // Check if the scenarios object contains the selected type
        if (!scenarios[type]) {
        console.error(`No scenarios found for type: ${type}`);
        return `No scenarios found for type: ${type}`;
      }
    
      // Look for the test case in the selected type category
      if (scenarios[type].includes(testCase)) {
        // Build the Gherkin scenario
        const selectedTemplate = template[type];
        if (selectedTemplate) {
          gherkinOutput = `Feature: ${flow}\n\nScenario: ${testCase}\n${selectedTemplate}\n\n`;
        } else {
          console.error(`Template for type: ${type} not found`);
          return `Template for type: ${type} not found`;
        }
      } else {
        console.error(`Test case "${testCase}" not found in selected category "${type}"`);
        return `Test case "${testCase}" not found in selected category "${type}"`;
      }
    
      console.log("Generated Gherkin Output:", gherkinOutput); // Log the final generated text
      return gherkinOutput;
    };     