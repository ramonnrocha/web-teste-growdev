import { useEffect, useRef, useState } from "react";
import {
  Send,
  Plus,
  Menu,
  MessageSquare,
  LogOut,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Hooks HTTP
import { useRoomInteractions } from "../http/use-room-interactions";
import { useCreateInteraction } from "../http/use-create-interaction";
import { useRooms } from "../http/use-rooms";
import { useCreateRoom } from "../http/use-create-room";

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
    if (!input.trim() || !activeRoomId || isSending) return;

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
    <main className="flex h-screen bg-[#0E0E10] text-zinc-100 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#171719] border-r border-zinc-800 transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <button
            onClick={handleStartNewChat}
            disabled={isCreatingRoom}
            className="flex items-center gap-3 px-4 py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 rounded-xl transition-all mb-6 group shadow-lg"
          >
            {isCreatingRoom ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="text-sm font-bold">Nova conversa</span>
          </button>

          <nav className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-3">
              Recentes
            </div>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoomId(room.id);
                  setSidebarOpen(false);
                  setErrorMessage(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                  activeRoomId === room.id
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:bg-zinc-800/40"
                }`}
              >
                <MessageSquare
                  className={`w-4 h-4 ${
                    activeRoomId === room.id ? "text-blue-400" : ""
                  }`}
                />
                <span className="truncate flex-1">{room.description}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* CHAT AREA */}
      <section className="flex-1 flex flex-col relative h-full">
        <header className="flex items-center px-4 py-3 border-b border-zinc-800 lg:hidden bg-[#0E0E10]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-zinc-400"
          >
            <Menu />
          </button>
          <span className="ml-4 text-sm font-medium truncate">
            {rooms.find((r) => r.id === activeRoomId)?.description ||
              "Nova conversa"}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-3xl mx-auto">
            {isLoadingMessages && activeRoomId ? (
              <div className="h-full flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-zinc-700" />
              </div>
            ) : interactions.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-700/30">
                  <Plus className="text-zinc-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  Como posso ajudar hoje?
                </h2>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {interactions.map((inter) => (
                  <div
                    key={inter.id}
                    className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-[#2F2F32] rounded-2xl px-5 py-3 text-[15px]">
                        {inter.prompt}
                      </div>
                    </div>
                    <div className="flex justify-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 shrink-0 flex items-center justify-center text-[10px] font-bold">
                        AI
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        {inter.response === null ? (
                          <div className="flex gap-1 py-4">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                          </div>
                        ) : (
                          <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-[15px]">
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
        <div className="p-4 bg-linear-to-t from-[#0E0E10] to-transparent">
          {errorMessage && (
            <div className="max-w-3xl mx-auto mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto relative group"
          >
            <textarea
              ref={textAreaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Pergunte ao Gemini..."
              className="w-full bg-[#1E1E21] border border-zinc-800/50 rounded-2xl pl-5 pr-14 py-4 focus:ring-2 focus:ring-blue-500/20 outline-none text-zinc-100 resize-none min-h-[60px]"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || !activeRoomId || isSending}
              className="absolute right-3 bottom-3 p-2.5 bg-zinc-100 text-black rounded-xl hover:bg-white disabled:opacity-10 transition-all"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </section>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  );
}
