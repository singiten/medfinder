import { useEffect, useState } from 'react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">MedFinder — frontend</h1>
      {error && <p className="text-red-400">Error: {error}</p>}
      {health && (
        <pre className="bg-slate-800 p-4 rounded">
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
      {!health && !error && <p>Loading…</p>}
    </div>
  );
}