import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/variables.css';
import './styles/global.css';

// ─── Scroll-Reveal via IntersectionObserver ───────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  const observe = () => {
    document.querySelectorAll('.reveal, .reveal-left').forEach((el) => {
      if (!el.classList.contains('visible')) {
        observer.observe(el);
      }
    });
  };

  // Initial run
  observe();

  // Re-run when React routes change (MutationObserver on #root)
  const mutObs = new MutationObserver(observe);
  mutObs.observe(document.getElementById('root'), { childList: true, subtree: true });
}

// Wait for first paint
requestAnimationFrame(() => setTimeout(initScrollReveal, 100));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
