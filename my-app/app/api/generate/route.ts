import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const { fileContent } = await request.json();

    if (!fileContent || typeof fileContent !== "string") {
      return Response.json(
        { success: false, error: "Invalid or missing file content" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `You are a test scenario generator for QA teams.

      Phase 1: Flow Understanding  
      1. Input: A Product Specification Document  
      2. Output: Categorized test scenarios based on user flows (e.g., Login, Search, Checkout)

      Instructions:  
      - Carefully analyze the provided specification document.  
      - Identify the key user flows based on the content.  
      - For each user flow, generate appropriate test cases.
      - Categorize each test case or scenario under the following detailed categories. Only include a category if there are relevant test cases for it — skip any category that has no applicable scenarios.

      Categories:
        1. Positive Test Cases: Valid inputs and expected behaviors  
        2. Negative Test Cases: Invalid inputs or incorrect actions that should be handled gracefully  
        3. Edge Test Cases: Boundary conditions, upper/lower limits, rare or extreme conditions  
        4. Error Fixing Test Cases: Validation that previously reported bugs or issues are now fixed  
        5. Functional Test Cases: Validation of business logic and core application functionality  
        6. Non-Functional Test Cases: Performance, load, security, scalability, reliability, etc.  
        7. Data-Related Test Cases: Validations around input formats, data consistency, required/optional fields  
        8. UI/UX Test Cases: Visual layout, responsiveness, user interactions, accessibility compliance  
        9. Recovery Test Cases: System behavior in the event of crashes, failures, interruptions, or retries  
        10. Configuration Test Cases: Cross-browser, cross-platform, environment-specific, or setup validations  
        11. API Test Cases: Backend request-response validation, status codes, schema compliance, and error handling  
        12. Compliance Test Cases: Validation of compliance with legal, financial, or regulatory standards (e.g., GDPR, TDS, MCA, RBI, IT compliance)  
        13. Smoke/Sanity Test Cases: High-level checks to verify if the application is stable post-deployment  
        14. Cross-User/Concurrency Test Cases: Validating simultaneous user access or concurrent modifications

      Output Format (strict JSON):
      {
        "Positive Test Cases": ["Scenario 1", "Scenario 2"],
        "Negative Test Cases": ["Scenario 1"],
        "Edge Test Cases": ["Scenario 1"],
        "Error Fixing Test Cases": ["Scenario 1"],
        "Others": ["Scenario 1"]
      }

      Important:
      - DO NOT return markdown, explanations, or any extra text.
      - Only return a valid JSON object matching the above format.
      - If the document is not related to a financial product built by ClearTax, return the string:
        "This document is not relevant to ClearTax’s financial product suite, and no test scenarios can be generated."

      Document Content:  
      ${fileContent}
      `
    });

    // Check the structure of response
    console.log("Full model result:", result);

    const scenarios = result?.text;

    if (!scenarios || typeof scenarios !== "string") {
      console.error("No valid text returned by Gemini");
      return Response.json(
        { success: false, error: "Model did not return valid text." },
        { status: 500 }
      );
    }

    // Check if the response is the fallback string
    if (scenarios.includes("not relevant to ClearTax")) {
      return Response.json({ success: false, error: scenarios }, { status: 200 });
    }

    // Log what we're trying to parse
    console.log("Trying to parse:", scenarios);

    const cleaned = scenarios
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    console.log("Cleaned Gemini output:", cleaned);

    const parsed = JSON.parse(cleaned);

    return Response.json({ success: true, scenarios: parsed }, { status: 200 });

  } catch (error) {
    console.error("Scenario generation error:", error);
    return Response.json(
      { success: false, error: "Failed to generate scenarios. Check console logs." },
      { status: 500 }
    );
  }
}