"use client";

import { useState } from "react";
import * as mammoth from "mammoth";
import { generateGherkinText } from "@/lib/generateGherkinText";

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gherkinText, setGherkinText] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [gherkinCategory, setGherkinCategory] = useState<string>("");
  const [gherkinTestCase, setGherkinTestCase] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null);

      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const reader = new FileReader();

        reader.onload = async (event) => {
          if (event.target?.result) {
            try {
              const arrayBuffer = event.target.result as ArrayBuffer;
              const result = await mammoth.extractRawText({ arrayBuffer });

              const content = result.value;

              setLoading(true);
              const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileContent: content }),
              });

              const data = await response.json();

              if (!response.ok) {
                setError("Failed to generate scenarios.");
              } else if (
                typeof data.scenarios === "string" &&
                data.scenarios.includes("not relevant to ClearTax")
              ) {
                setError(data.scenarios);
              } else {
                setScenarios(data.scenarios);
              }
            } catch (err) {
              console.error("Error processing file:", err);
              setError("Something went wrong while processing the file.");
            } finally {
              setLoading(false);
            }
          }
        };

        reader.readAsArrayBuffer(file);
      } else {
        setError("Please upload a valid .docx file.");
      }
    }
  };

  const handleGenerateClick = () => {
    if (scenarios) {
      setShowModal(true); // Show modal first
    }
  };

  const confirmGenerate = () => {
    if (scenarios && gherkinCategory && gherkinTestCase && fileName) {
      const output = generateGherkinText(
        scenarios, 
        fileName.split(".")[0], 
        gherkinCategory, 
        gherkinTestCase  
      );
      setGherkinText(output);
      setShowModal(false);
    } else {
      console.log("Please select a category and test case.");  
    }
  };

  const handleCopyClick = () => {
    if (gherkinText) {
      navigator.clipboard.writeText(gherkinText)
      .catch((err) => {
        console.error("Failed to copy text:", err);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-2xl">
        <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-800">
          Welcome to QA AI
        </h1>

        <div className="flex">
          <div className="flex flex-col gap-4 items-center">
            <label
              htmlFor="file-upload"
              className="cursor-pointer px-4 py-2 border border-solid border-gray-300 rounded-md bg-blue-500 text-white font-medium text-sm sm:text-base hover:bg-blue-600"
            >
              Upload your file
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {fileName && (
            <div className="flex flex-col gap-4 items-center ml-4">
              <button
                onClick={handleGenerateClick}
                className="cursor-pointer px-4 py-2 border border-solid border-gray-300 rounded-md bg-green-600 text-white font-medium text-sm sm:text-base hover:bg-green-700"
              >
                Generate Gherkin Text
              </button>
            </div>
          )}
        </div>

        {/* Result Section */}
        <section className="flex flex-col gap-4 items-center w-full text-center">
          {fileName && <p className="text-lg">File uploaded: {fileName}</p>}

          {loading && <p className="text-blue-600">Generating test scenarios...</p>}

          {error && <p className="text-red-600">{error}</p>}

          {/* Display the results of the scenarios*/}
          {scenarios && !gherkinText &&
            Object.entries(scenarios).map(([category, items]) => (
              <div key={category} className="w-full text-left">
                <h3 className="font-bold mt-4 mb-2 text-gray-700">{category}</h3>
                <ul className="list-disc pl-6">
                  {items.map((item, i) => (
                    <li key={i} className="text-gray-800">{item}</li>
                  ))}
                </ul>
              </div>
            ))}

          {/* Display Gherkin text once it's generated */}
          {gherkinText && (
          <div className="w-full mt-8 bg-gray-100 rounded p-4 relative">
            <button
              className="absolute top-2 left-2 bg-white/80 backdrop-blur-md border border-gray-300 shadow-md rounded-xl px-3 py-1 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-white transition"
              aria-label="Convert to karate code"
            >
              Convert
            </button>
            <button
              onClick={handleCopyClick}
              className="absolute top-2 right-2 bg-white/80 backdrop-blur-md border border-gray-300 shadow-md rounded-xl px-3 py-1 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-white transition"
              aria-label="Copy to clipboard"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <h3 className="text-lg font-semibold mb-2">Generated Gherkin Text</h3>
            <pre className="font-mono whitespace-pre-wrap text-left text-sm text-gray-800" style={{ fontFamily: 'Arial, sans-serif', wordWrap: 'break-word' }}>
              {gherkinText}
            </pre>
          </div>
        )}

        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Select Test Case Type</h2>

            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={gherkinCategory}
              onChange={(e) => {
                setGherkinCategory(e.target.value);
                setGherkinTestCase("");
              }}
            >
              <option value="">-- Choose a category --</option>
              <option value="Positive Test Cases">Positive</option>
              <option value="Negative Test Cases">Negative</option>
              <option value="UI/UX Test Cases">UI/UX</option>
              <option value="Compliance Test Cases">Compliance</option>
              <option value="Functional Test Cases">Functional</option>
              <option value="Data-Related Test Cases">Data-Related</option>
              <option value="Smoke/Sanity Test Cases">Smoke/Sanity</option>
            </select>

            {gherkinCategory && scenarios?.[gherkinCategory] && (
              <select
                className="w-full border px-3 py-2 rounded mb-4"
                value={gherkinTestCase}
                onChange={(e) => setGherkinTestCase(e.target.value)}
              >
                <option value="">-- Choose a test case --</option>
                {scenarios?.[gherkinCategory].map((testCase, index) => (
                  <option key={index} value={testCase}>
                    {testCase}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={confirmGenerate}
                disabled={!gherkinCategory}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}