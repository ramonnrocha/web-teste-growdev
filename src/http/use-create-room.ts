import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateRoomResponse } from "./types/create-room-response";

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("Usuário não encontrado");
      }

      const response = await fetch(`http://localhost:3333/rooms/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result: CreateRoomResponse = await response.json();

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-rooms"] });
    },
  });
}
