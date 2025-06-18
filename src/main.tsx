/**
 * @fileoverview This is the main entry point for the entire application. It's responsible for
 * rendering the React app to the DOM. It's the first file that gets executed, so it's pretty
 * important. Don't mess with it unless you know what you're doing.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
