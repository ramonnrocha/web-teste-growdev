import { useQuery } from "@tanstack/react-query";
import type { GetRoomInteractionsResponse } from "./types/get-room-interactions-response";
import { API_URL } from "./api-url";

export function useRoomInteractions(roomId: string) {
  return useQuery({
    queryKey: ["get-interactions", roomId],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/rooms/${roomId}/interactions`
      );
      const result: GetRoomInteractionsResponse = await response.json();

      return result;
    },
  });
}
