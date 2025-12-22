import { useMutation } from "@tanstack/react-query";
import type { LoginResponse } from "./types/login-reponse";
import type { LoginRequest } from "./types/login-request";

const TOKEN_STORAGE_KEY = "token";

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await fetch("http://localhost:3333/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Erro ao realizar login",
        }));
        throw new Error(
          error.message || `Erro ${response.status}: ${response.statusText}`
        );
      }

      const result: LoginResponse = await response.json();

      if (!result.token) {
        throw new Error("Token não recebido na resposta");
      }

      console.log("result", result);
      return result;
    },

    onSuccess: (data) => {
      // Armazena o token no localStorage após login bem-sucedido
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    },
  });
}
