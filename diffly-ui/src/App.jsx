import { useState } from "react";
import { createTwoFilesPatch } from "diff";
import * as Diff2Html from "diff2html"; // Correct—this will give you all named exports!
import "diff2html/bundles/css/diff2html.min.css";


function App() {
  // ...rest of your code...

    // For rendering diffs:
    // ...inside render:
    /*const html = Diff2Html.getPrettyHtml(patch, {
      inputFormat: "diff",
      showFiles: false,
      matching: "lines",
      outputFormat: "side-by-side",
    });
*/
	console.log("Diff2Html exports:", Diff2Html);
  // ...rest of your code...

  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [diffResult, setDiffResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [collapsedFiles, setCollapsedFiles] = useState({});
  const [allCollapsed, setAllCollapsed] = useState(false);

  const handleCompare = async () => {
    if (!file1 || !file2) {
      alert("Please select both zip files");
      return;
    }

    setLoading(true);
    setDiffResult(null);

    const formData = new FormData();
    formData.append("zip1", file1);
    formData.append("zip2", file2);

    try {
      const response = await fetch("http://127.0.0.1:8000/compare", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setDiffResult(data);
      setCollapsedFiles({});
      setAllCollapsed(false);
    } catch (err) {
      console.error(err);
      alert("Error comparing files");
    } finally {
      setLoading(false);
    }
  };

  const getAllFiles = () => {
    if (!diffResult) return [];
    const allFilesSet = new Set();
    diffResult.diff.added.forEach((f) => allFilesSet.add(f));
    diffResult.diff.removed.forEach((f) => allFilesSet.add(f));
    diffResult.diff.modified.forEach((f) => allFilesSet.add(f.file));
    return Array.from(allFilesSet).sort();
  };

  const getFileDiff = (file) => {
    if (!diffResult) return { old: "", new: "" };
    const mod = diffResult.diff.modified.find((f) => f.file === file);
    if (mod) {
      return { old: mod.old_content ?? "", new: mod.new_content ?? "" };
    }
    if (diffResult.diff.added.includes(file)) {
      return { old: "", new: diffResult.contents2?.[file] ?? "" };
    }
    if (diffResult.diff.removed.includes(file)) {
      return { old: diffResult.contents1?.[file] ?? "", new: "" };
    }
    return { old: "", new: "" };
  };

  const toggleFile = (file) => {
    setCollapsedFiles((prev) => ({
      ...prev,
      [file]: !prev[file],
    }));
  };

  const setAll = (collapse) => {
    const allFiles = getAllFiles();
    const state = {};
    allFiles.forEach((file) => (state[file] = collapse));
    setCollapsedFiles(state);
    setAllCollapsed(collapse);
  };

  const downloadJSON = (content, filename) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Diffly - Beyond Compare Style Diff</h1>
      <div className="flex gap-2 items-center mb-4">
        <input
          type="file"
          accept=".zip"
          onChange={(e) => setFile1(e.target.files[0])}
        />
        <input
          type="file"
          accept=".zip"
          onChange={(e) => setFile2(e.target.files[0])}
        />
        <button
          onClick={handleCompare}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Compare
        </button>
        {diffResult && (
          <>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => downloadJSON(diffResult.diff, "diff.json")}
            >
              Download Diff JSON
            </button>
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={() =>
                downloadJSON({ summary: diffResult.summary }, "summary.json")
              }
            >
              Download AI Summary
            </button>
          </>
        )}
      </div>
      {loading && <p>Comparing files, please wait...</p>}
      {diffResult && (
        <>
          <div className="mb-4">
            <button
              onClick={() => setAll(false)}
              className="px-3 py-1 bg-blue-600 text-white rounded mr-2"
              disabled={!allCollapsed}
            >
              Expand All
            </button>
            <button
              onClick={() => setAll(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded"
              disabled={allCollapsed}
            >
              Collapse All
            </button>
          </div>
          <div className="space-y-8">
            {getAllFiles().map((file) => {
              const { old, new: newContent } = getFileDiff(file);
              let statusColor = "text-gray-700";
              let status = "";
              if (diffResult.diff.added.includes(file)) {
                statusColor = "text-green-600";
                status = "[ADDED]";
              } else if (diffResult.diff.removed.includes(file)) {
                statusColor = "text-red-600";
                status = "[REMOVED]";
              } else if (
                diffResult.diff.modified.find((f) => f.file === file)
              ) {
                statusColor = "text-yellow-600 font-semibold";
                status = "[MODIFIED]";
              }

              const patch = createTwoFilesPatch(
                `old/${file}`,
                `new/${file}`,
                old,
                newContent,
                "",
                "",
                { context: 4 }
              );
              // The key here: use Diff2Html.default.getPrettyHtml for Vite/CJS interop!
              const html = Diff2Html.html(patch, {
                inputFormat: "diff",
                showFiles: false,
                matching: "lines",
                outputFormat: "side-by-side",
              });

              return (
                <div key={file} className="border rounded bg-white">
                  <div
                    className={`flex items-center justify-between px-4 py-2 bg-gray-50 cursor-pointer rounded-t ${statusColor}`}
                    onClick={() => toggleFile(file)}
                    style={{ userSelect: "none" }}
                  >
                    <span>
                      {collapsedFiles[file] ? "▶" : "▼"} <b>{status}</b> {file}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      (click to {collapsedFiles[file] ? "expand" : "collapse"})
                    </span>
                  </div>
                  {!collapsedFiles[file] && (
                    <div className="p-1" style={{ overflowX: "auto" }}>
                      <div
                        dangerouslySetInnerHTML={{ __html: html }}
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {diffResult.summary && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h3 className="font-bold text-yellow-800 mb-2">AI Summary</h3>
              <p>{diffResult.summary}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
