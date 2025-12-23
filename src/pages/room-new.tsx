import {
  AlertCircle,
  Loader2,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCreateInteraction } from "../http/use-create-interaction";
import { useCreateRoom } from "../http/use-create-room";
// Hooks HTTP
import { useRoomInteractions } from "../http/use-room-interactions";
import { useRooms } from "../http/use-rooms";

export function RoomNew() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() =>
    localStorage.getItem("roomId")
  );
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const { data: rooms = [] } = useRooms();
  const { mutateAsync: createRoom, isPending: isCreatingRoom } =
    useCreateRoom();
  const { data: interactions = [], isLoading: isLoadingMessages } =
    useRoomInteractions(activeRoomId ?? "");
  const { mutateAsync: createInteraction, isPending: isSending } =
    useCreateInteraction(activeRoomId ?? "");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interactions]);

  // FUNÇÃO MELHORADA: Cria a sala imediatamente no banco
  const handleStartNewChat = async () => {
    setErrorMessage(null);
    try {
      const result = await createRoom();
      setActiveRoomId(result.roomId);
      localStorage.setItem("roomId", result.roomId);
      setInput("");
      setSidebarOpen(false);

      setTimeout(() => textAreaRef.current?.focus(), 100);
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      setErrorMessage("Não foi possível criar uma nova sala. Tente novamente.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(input.trim() && activeRoomId) || isSending) return;

    const userPrompt = input.trim();
    setInput("");
    setErrorMessage(null);

    try {
      await createInteraction({ prompt: userPrompt });
    } catch (error: any) {
      console.error("Erro ao enviar:", error);
      setInput(userPrompt); // Devolve o texto para o usuário não perder a pergunta

      // Trata especificamente o erro de cota que você recebeu
      if (error.status === 429) {
        setErrorMessage(
          "Limite de mensagens atingido (Cota do Gemini). Aguarde um minuto."
        );
      } else {
        setErrorMessage("Ocorreu um erro ao processar sua mensagem.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <main className="flex h-screen overflow-hidden bg-[#0E0E10] font-sans text-zinc-100">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-zinc-800 border-r bg-[#171719] transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <button
            className="group mb-6 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-black shadow-lg transition-all hover:bg-zinc-200 disabled:opacity-50"
            disabled={isCreatingRoom}
            onClick={handleStartNewChat}
          >
            {isCreatingRoom ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="font-bold text-sm">Nova conversa</span>
          </button>

          <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-2">
            <div className="mb-3 px-3 font-bold text-[11px] text-zinc-500 uppercase tracking-widest">
              Recentes
            </div>
            {rooms.map((room) => (
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                  activeRoomId === room.id
                    ? "border border-zinc-700 bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/40"
                }`}
                key={room.id}
                onClick={() => {
                  setActiveRoomId(room.id);
                  setSidebarOpen(false);
                  setErrorMessage(null);
                }}
              >
                <MessageSquare
                  className={`h-4 w-4 ${
                    activeRoomId === room.id ? "text-blue-400" : ""
                  }`}
                />
                <span className="flex-1 truncate">{room.description}</span>
              </button>
            ))}
          </nav>

          <button
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-sm text-zinc-500 transition-all hover:bg-red-400/10 hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* CHAT AREA */}
      <section className="relative flex h-full flex-1 flex-col">
        <header className="flex items-center border-zinc-800 border-b bg-[#0E0E10] px-4 py-3 lg:hidden">
          <button
            className="p-2 text-zinc-400"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </button>
          <span className="ml-4 truncate font-medium text-sm">
            {rooms.find((r) => r.id === activeRoomId)?.description ||
              "Nova conversa"}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-3xl">
            {isLoadingMessages && activeRoomId ? (
              <div className="flex h-full items-center justify-center py-20">
                <Loader2 className="animate-spin text-zinc-700" />
              </div>
            ) : interactions.length === 0 ? (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700/30 bg-zinc-800/50">
                  <Plus className="text-zinc-500" />
                </div>
                <h2 className="mb-2 font-semibold text-2xl">
                  Como posso ajudar hoje?
                </h2>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {interactions.map((inter) => (
                  <div
                    className="fade-in slide-in-from-bottom-2 flex animate-in flex-col gap-6"
                    key={inter.id}
                  >
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[#2F2F32] px-5 py-3 text-[15px]">
                        {inter.prompt}
                      </div>
                    </div>
                    <div className="flex justify-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-blue-600 to-purple-600 font-bold text-[10px]">
                        AI
                      </div>
                      <div className="min-w-0 flex-1 pt-1">
                        {inter.response === null ? (
                          <div className="flex gap-1 py-4">
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-[15px] text-zinc-300 leading-relaxed">
                            {inter.response}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="bg-linear-to-t from-[#0E0E10] to-transparent p-4">
          {errorMessage && (
            <div className="fade-in slide-in-from-top-1 mx-auto mb-4 flex max-w-3xl animate-in items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" /> {errorMessage}
            </div>
          )}

          <form
            className="group relative mx-auto max-w-3xl"
            onSubmit={handleSendMessage}
          >
            <textarea
              className="min-h-[60px] w-full resize-none rounded-2xl border border-zinc-800/50 bg-[#1E1E21] py-4 pr-14 pl-5 text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Pergunte ao Gemini..."
              ref={textAreaRef}
              rows={1}
              value={input}
            />
            <button
              className="absolute right-3 bottom-3 rounded-xl bg-zinc-100 p-2.5 text-black transition-all hover:bg-white disabled:opacity-10"
              disabled={!(input.trim() && activeRoomId) || isSending}
              type="submit"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </section>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  );
}
