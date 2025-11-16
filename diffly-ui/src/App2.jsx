import { useState } from "react";

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [diffResult, setDiffResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      console.error(err);
      alert("Error comparing files");
    } finally {
      setLoading(false);
    }
  };

  const renderDiff = () => {
    if (!diffResult?.diff) return null;

    return (
      <div className="mt-4 space-y-6">
        {diffResult.diff.added.length > 0 && (
          <div>
            <h3 className="font-bold text-green-700">Added Files:</h3>
            <ul className="list-disc ml-6 text-green-600">
              {diffResult.diff.added.map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {diffResult.diff.removed.length > 0 && (
          <div>
            <h3 className="font-bold text-red-700">Removed Files:</h3>
            <ul className="list-disc ml-6 text-red-600">
              {diffResult.diff.removed.map(f => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {diffResult.diff.modified.length > 0 && (
          <div>
            <h3 className="font-bold text-blue-700">Modified Files:</h3>
            {diffResult.diff.modified.map(f => (
              <div key={f.file} className="mb-4 p-2 border rounded bg-gray-50">
                <p className="font-semibold">{f.file} (lines changed: {f.lines_changed})</p>
                <pre className="overflow-auto bg-gray-100 p-2 rounded max-h-48">
                  {f.diff_preview.map((line, idx) => {
                    let color = "";
                    if (line.startsWith("+")) color = "text-green-700";
                    else if (line.startsWith("-")) color = "text-red-700";
                    return <div key={idx} className={color}>{line}</div>;
                  })}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Diffly - Code Diff MVP</h1>

      <div className="flex gap-2 items-center mb-4">
        <input type="file" accept=".zip" onChange={e => setFile1(e.target.files[0])} />
        <input type="file" accept=".zip" onChange={e => setFile2(e.target.files[0])} />
        <button
          onClick={handleCompare}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Compare
        </button>
      </div>

      {loading && <p>Comparing files, please wait...</p>}

      {diffResult && (
        <div className="mt-6">
          {renderDiff()}

          {diffResult.summary && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h3 className="font-bold text-yellow-800 mb-2">AI Summary</h3>
              <p>{diffResult.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

