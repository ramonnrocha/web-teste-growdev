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
            {/* Adicione uma página inicial ou redirecione para uma sala específica */}
            <Route
              index
              element={<div>Selecione ou crie uma sala na lateral</div>}
            />
            <Route path="room/:roomId" element={<RoomNew />} />
          </Route>

          {/* Se nada bater, vai para o login em vez de voltar para a rota protegida */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
