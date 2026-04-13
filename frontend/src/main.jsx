import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import css from './styles';

// Inject global styles once
const style = document.createElement('style');
style.textContent = css;
document.head.prepend(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
