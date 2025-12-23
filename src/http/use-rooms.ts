import { useQuery } from "@tanstack/react-query";
import type { GetRoomsResponse } from "./types/get-rooms-response";
import { API_URL } from "./api-url";

export function useRooms() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    throw new Error("Usuário não encontrado");
  }

  return useQuery({
    queryKey: ["get-rooms"],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/rooms/${userId}`
      );
      const result: GetRoomsResponse = await response.json();

      return result;
    },
  });
}
