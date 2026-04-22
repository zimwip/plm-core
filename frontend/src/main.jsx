import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import css from './styles';
import { initTheme } from './theme';

// Inject global styles once.
// Append (not prepend) so theme-aware rules override the boot-flash fallback
// defined inline in index.html.
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

// Apply saved theme preference before first paint
initTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
