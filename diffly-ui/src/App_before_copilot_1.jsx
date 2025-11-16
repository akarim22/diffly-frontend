import { useState } from "react";
import DiffViewer from "react-diff-viewer";

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [diffResult, setDiffResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleCompare = async () => {
    if (!file1 || !file2) {
      alert("Please select both zip files");
      return;
    }

    setLoading(true);
    setDiffResult(null);
    setSelectedFile(null);

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
    } catch (err) {
      console.error(err);
      alert("Error comparing files");
    } finally {
      setLoading(false);
    }
  };

  // Example helper to build the file tree for both zips (flat view for simplicity)
  const getAllFiles = () => {
    if (!diffResult) return [];
    // Assume diffResult.diff.added, removed, modified are arrays of file names/objects
    const allFilesSet = new Set();
    diffResult.diff.added.forEach((f) => allFilesSet.add(f));
    diffResult.diff.removed.forEach((f) => allFilesSet.add(f));
    diffResult.diff.modified.forEach((f) => allFilesSet.add(f.file));
    return Array.from(allFilesSet).sort();
  };

  // When a file is selected, get its content for diffing
  const getFileDiff = (file) => {
    if (!diffResult) return { old: "", new: "" };

    // Modified file: supply both versions
    const mod = diffResult.diff.modified.find((f) => f.file === file);
    if (mod) {
      return { old: mod.old_content ?? "", new: mod.new_content ?? "" };
    }

    // File entirely added
    if (diffResult.diff.added.includes(file)) {
      return { old: "", new: diffResult.contents2[file] ?? "" };
    }
    // File entirely removed
    if (diffResult.diff.removed.includes(file)) {
      return { old: diffResult.contents1[file] ?? "", new: "" };
    }

    return { old: "", new: "" };
  };

  // Download helpers unchanged
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
        <input type="file" accept=".zip" onChange={(e) => setFile1(e.target.files[0])} />
        <input type="file" accept=".zip" onChange={(e) => setFile2(e.target.files[0])} />
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
              onClick={() => downloadJSON({ summary: diffResult.summary }, "summary.json")}
            >
              Download AI Summary
            </button>
          </>
        )}
      </div>
      {loading && <p>Comparing files, please wait...</p>}
      <div className="flex gap-6">
        {/* Sidebar/tree to select files */}
        <div className="w-64 border-r pr-4 overflow-auto" style={{ maxHeight: "70vh" }}>
          <h2 className="font-bold mb-2">Files</h2>
          <ul>
            {diffResult &&
              getAllFiles().map((file) => {
                // Get status for color
                let statusColor = "text-gray-700";
                if (diffResult.diff.added.includes(file)) statusColor = "text-green-600";
                else if (diffResult.diff.removed.includes(file)) statusColor = "text-red-600";
                else if (diffResult.diff.modified.find((f) => f.file === file)) statusColor = "text-yellow-600 font-semibold";

                return (
                  <li
                    key={file}
                    className={`cursor-pointer px-2 py-1 rounded hover:bg-blue-100 ${statusColor} ${selectedFile === file ? "bg-blue-200" : ""}`}
                    onClick={() => setSelectedFile(file)}
                  >
                    {file}
                  </li>
                );
              })}
          </ul>
        </div>
        {/* Main content: Side by side code diff */}
        <div className="flex-1">
          {!diffResult && <p>Select two zip files and run compare.</p>}
          {diffResult && selectedFile && (
            <div>
              <h3 className="font-bold mb-2">Comparing: <span className="text-blue-800">{selectedFile}</span></h3>
              <div className="border rounded bg-white overflow-auto">
                <DiffViewer
                  oldValue={getFileDiff(selectedFile).old}
                  newValue={getFileDiff(selectedFile).new}
                  splitView={true}
                  hideLineNumbers={false}
                  showDiffOnly={false}
                  leftTitle="Old"
                  rightTitle="New"
                  styles={{
                    variables: {
                      addedBackground: "#e6ffe6",
                      removedBackground: "#ffe6e6",
                    }
                  }}
                />
              </div>
            </div>
          )}
          {diffResult && !selectedFile && (
            <div className="text-gray-500 mt-8 text-lg">Select a file on the left to view its diff</div>
          )}
          {diffResult && diffResult.summary && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h3 className="font-bold text-yellow-800 mb-2">AI Summary</h3>
              <p>{diffResult.summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
