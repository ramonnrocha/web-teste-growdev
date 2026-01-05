import { AlertCircle, Loader2, LogOut, Menu, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCreateInteraction } from "../http/use-create-interaction";
import { useRoomInteractions } from "../http/use-room-interactions";

export function RoomNew() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const roomId = localStorage.getItem("roomId");

  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  if (!token || !roomId) {
    return <Navigate to="/login" />;
  }

  const { data: interactions = [], isLoading } = useRoomInteractions(roomId);

  const { mutateAsync: createInteraction, isPending: isSending } =
    useCreateInteraction(roomId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interactions]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const prompt = input.trim();
    setInput("");
    setErrorMessage(null);

    try {
      await createInteraction({ prompt });
    } catch (error: any) {
      console.error(error);
      setInput(prompt);

      if (error.status === 429) {
        setErrorMessage("Limite de mensagens atingido. Aguarde um minuto.");
      } else {
        setErrorMessage("Erro ao processar sua mensagem.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <main className="flex h-screen overflow-hidden bg-[#0E0E10] text-zinc-100">
      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-800 bg-[#171719]
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 text-sm font-semibold text-zinc-300">
            Sua conversa
          </div>

          <div className="flex-1 text-sm text-zinc-500">
            Esta conta possui apenas uma sala ativa.
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-zinc-500 hover:bg-red-400/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* CHAT */}
      <section className="flex flex-1 flex-col">
        {/* HEADER MOBILE */}
        <header className="flex items-center gap-3 border-b border-zinc-800 bg-[#0E0E10] px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400"
          >
            <Menu />
          </button>
          <span className="text-sm font-medium">Conversa</span>
        </header>

        {/* MENSAGENS */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-3xl">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-zinc-700" />
              </div>
            ) : interactions.length === 0 ? (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <h2 className="mb-2 text-2xl font-semibold">
                  Como posso ajudar hoje?
                </h2>
                <p className="text-zinc-500">Faça uma pergunta para começar.</p>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {interactions.map((inter) => (
                  <div
                    key={inter.id}
                    className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2"
                  >
                    {/* USER */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[#2F2F32] px-5 py-3 text-sm">
                        {inter.prompt}
                      </div>
                    </div>

                    {/* AI */}
                    <div className="flex gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-[10px] font-bold">
                        AI
                      </div>

                      <div className="flex-1">
                        {inter.response === null ? (
                          <div className="flex gap-1 py-4">
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
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

        {/* INPUT */}
        <div className="bg-gradient-to-t from-[#0E0E10] to-transparent p-4">
          {errorMessage && (
            <div className="mx-auto mb-4 max-w-3xl rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 flex gap-2">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="relative mx-auto max-w-3xl"
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
              rows={1}
              className="min-h-[60px] w-full resize-none rounded-2xl border border-zinc-800/50 bg-[#1E1E21] py-4 pl-5 pr-14 text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="absolute bottom-3 right-3 rounded-xl bg-zinc-100 p-2.5 text-black hover:bg-white disabled:opacity-10"
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
    </main>
  );
}
