import { useQuery } from "@tanstack/react-query";
import type { GetRoomInteractionsResponse } from "./types/get-room-interactions-response";

export function useRoomInteractions(roomId: string) {
  return useQuery({
    queryKey: ["get-interactions", roomId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3333/rooms/${roomId}/interactions`
      );
      const result: GetRoomInteractionsResponse = await response.json();

      return result;
    },
  });
}
