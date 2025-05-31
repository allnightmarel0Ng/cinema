// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Инициализация Sentry для мониторинга ошибок (опционально)
// import * as Sentry from '@sentry/react';
// Sentry.init({
//     dsn: 'YOUR_SENTRY_DSN',
//     integrations: [new Sentry.BrowserTracing()],
//     tracesSampleRate: 0.2,
// });

// Создание корневого элемента
const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

// Рендеринг приложения
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);