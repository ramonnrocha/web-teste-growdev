export type GetRoomInteractionsResponse = Array<{
  id: string;
  prompt: string;
  response: string | null;
  createdAt: string;
}>;
