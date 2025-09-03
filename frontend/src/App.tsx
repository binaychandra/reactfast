import { useState, type FormEvent } from 'react';

export default function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResult(data.result ?? 'No result');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="form-wrapper">
        <label htmlFor="text-input" className="label">
          Send a message to the backend
        </label>
        <form onSubmit={onSubmit} className="form-row">
          <input
            id="text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type here..."
            className="input"
          />
          <button type="submit" className="button" disabled={loading || !text}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {error && <div className="error-text">{error}</div>}
        {result && (
          <div className="result-wrapper">
            <p className="result-text">
              <span className="result-label">Response:</span> {result}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
