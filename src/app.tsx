import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { Login } from "./pages/login";
import { ProtectedRoute } from "./protected-routes";
import { RoomNew } from "./pages/room-new";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute />}>
            <Route path="rooms" element={<RoomNew />} />
          </Route>

          {/* Se nada bater, vai para o login em vez de voltar para a rota protegida */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
