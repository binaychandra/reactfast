export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', padding: 24 }}>
      <h1>React + FastAPI</h1>
      <p>Welcome! This React app is served by FastAPI under the /app path.</p>
      <ul>
        <li>Frontend build output: frontend/dist</li>
        <li>Served from FastAPI at: /app</li>
      </ul>
    </div>
  );
}
