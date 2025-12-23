import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "./api-url";

// Tipagens baseadas no seu backend
interface Interaction {
  id: string;
  prompt: string;
  response: string | null;
  createdAt: string;
  isGenerating?: boolean; // Campo virtual para o front-end
}

export function useCreateInteraction(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prompt }: { prompt: string }) => {
      const response = await fetch(
        `${API_URL}/rooms/${roomId}/interactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) throw new Error("Erro ao enviar mensagem");
      return response.json() as Promise<Interaction>;
    },

    onMutate: async ({ prompt }) => {
      // Cancela refetchs para não sobrescrever o optimistic update
      await queryClient.cancelQueries({
        queryKey: ["get-interactions", roomId],
      });

      const previousInteractions = queryClient.getQueryData<Interaction[]>([
        "get-interactions",
        roomId,
      ]);

      const newInteraction: Interaction = {
        id: crypto.randomUUID(),
        prompt,
        response: null,
        createdAt: new Date().toISOString(),
        isGenerating: true,
      };

      // Adiciona a mensagem do usuário imediatamente ao topo ou fim da lista
      queryClient.setQueryData<Interaction[]>(
        ["get-interactions", roomId],
        (old) => [...(old || []), newInteraction]
      );

      return { previousInteractions, newInteraction };
    },

    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData<Interaction[]>(
        ["get-interactions", roomId],
        (old) =>
          old?.map((item) =>
            item.id === context.newInteraction.id
              ? { ...data, isGenerating: false }
              : item
          )
      );

      // Opcional: Invalida a query das "rooms" para atualizar a descrição na lateral
      queryClient.invalidateQueries({ queryKey: ["get-rooms"] });
    },

    onError: (_err, _variables, context) => {
      if (context?.previousInteractions) {
        queryClient.setQueryData(
          ["get-interactions", roomId],
          context.previousInteractions
        );
      }
    },
  });
}
