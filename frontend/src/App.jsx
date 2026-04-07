import { createBrowserRouter, RouterProvider } from 'react-router-dom'; // Убрал неиспользуемый Navigate
import { lazy, Suspense } from 'react';
import Background from './components/background'; // Импортируй компонент (предполагаю путь src/components/Background.jsx)
import ProtectedRoute from './components/protected-route'

const Entry = lazy(() => import('./pages/Entry'));
const Room = lazy(() => import('./pages/Room'));
const Settings = lazy(() => import('./pages/Settings'));
const Start = lazy(() => import('./pages/Start'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Recovery = lazy(() => import('./pages/Recovery'));
const Verify = lazy(() => import('./pages/Verify'));
const JoinRoom = lazy(() => import('./pages/JoinRoom'));

const router = createBrowserRouter([
  { path: '*', element: <NotFound /> },
  { path: '/', element: <Entry /> },
  { path: '/start', element: (
    <ProtectedRoute>
      <Start />
    </ProtectedRoute>
  ) },
  { path: '/room', element: (
    <ProtectedRoute>
      <Room />
    </ProtectedRoute>
  )},
  { path: '/settings', element: (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  ) },
  { path: '/auth/verify', element: <Verify /> },
  { path: '/recovery', element: <Recovery /> },
  { path: "/rooms/join/:token", element: <JoinRoom /> },
])

export default function App() {
  return (
    <>
      <Background /> 
      <Suspense fallback={<div>Загрузка...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}