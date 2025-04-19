import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');
if (!container) {
  throw new Error("ルート要素が見つかりませんでした");
}
const root = ReactDOM.createRoot(container); // ✅ container は HTMLElement 確定！

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// reportWebVitals();