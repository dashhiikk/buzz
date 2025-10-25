import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

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
      <Suspense fallback={<div>Загрузка...</div>}>
        <RouterProvider router={router} />
      </Suspense>
  );
}
