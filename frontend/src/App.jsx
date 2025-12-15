import { createBrowserRouter, RouterProvider } from 'react-router-dom'; // Убрал неиспользуемый Navigate
import { lazy, Suspense } from 'react';
import Background from './components/background'; // Импортируй компонент (предполагаю путь src/components/Background.jsx)

const Entry = lazy(() => import('./pages/Entry'));
const Friend = lazy(() => import('./pages/Friend'));
const Room = lazy(() => import('./pages/Room'));
const Settings = lazy(() => import('./pages/Settings'));
const Start = lazy(() => import('./pages/Start'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Recovery = lazy(() => import('./pages/Recovery'));

const router = createBrowserRouter([
  { path: '*', element: <NotFound /> },
  { path: '/', element: <Entry /> },
  { path: '/friend', element: <Friend /> },
  { path: '/room', element: <Room /> },
  { path: '/settings', element: <Settings /> },
  { path: '/start', element: <Start /> },
  { path: '/recovery', element: <Recovery /> },
])

export default function App() {
  return (
    <>
      <Background /> {/* Фон с анимацией - absolute, так что будет под всем контентом */}
      <Suspense fallback={<div>Загрузка...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}