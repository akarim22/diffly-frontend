import { useState } from "react";

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!file1 || !file2) {
      alert("Please select both zip files");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("zip1", file1);
    formData.append("zip2", file2);

    try {
      const response = await fetch("http://127.0.0.1:8000/compare", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error comparing files");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Diffly - Code Diff MVP</h1>

      <input type="file" accept=".zip" onChange={e => setFile1(e.target.files[0])} />
      <input type="file" accept=".zip" onChange={e => setFile2(e.target.files[0])} className="ml-2" />
      <button onClick={handleCompare} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
        Compare
      </button>

      {loading && <p>Comparing...</p>}

      {result && (
        <pre className="mt-4 bg-gray-100 p-4 rounded max-h-96 overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
