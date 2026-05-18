import { BrowserRouter, useRoutes } from 'react-router-dom';
import { browserRoutes } from './routes';

function AppRoutes() {
  return useRoutes(browserRoutes);
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
