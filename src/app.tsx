import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Login } from "./pages/login";
import { RoomNew } from "./pages/room-new";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Login />} path="/login" index />

          <Route element={<RoomNew />} path="/" />

          <Route element={<Navigate replace to="/login" />} path="*" />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
