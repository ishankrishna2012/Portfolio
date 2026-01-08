import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Starting application...");

// Global error handler for module loading failures
window.addEventListener('error', (e) => {
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.innerHTML === '') {
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; color: #333;">
        <h1 style="font-size: 20px; font-weight: 600;">Startup Error</h1>
        <p style="margin-top: 10px; color: #666;">${e.message}</p>
      </div>
    `;
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="color:red; padding: 20px;">Fatal Error: Root element not found.</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Application mounted successfully.");
} catch (error) {
  console.error("Application failed to mount:", error);
  rootElement.innerHTML = `
    <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: system-ui, sans-serif; text-align: center;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">Something went wrong</h1>
      <p style="color: #666; max-width: 400px;">The application failed to start. Please check the console for details.</p>
      <pre style="margin-top: 20px; background: #f5f5f5; padding: 10px; border-radius: 8px; font-size: 12px; text-align: left;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `;
}