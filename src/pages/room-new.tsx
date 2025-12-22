import { useEffect, useRef, useState } from "react";
import { Send, Plus, Menu, MessageSquare, LogOut } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useRoomInteractions } from "../http/use-room-interactions"; // ajuste o caminho
import { useCreateInteraction } from "../http/use-create-interaction";

export function RoomNew() {
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  if (!roomId) return <Navigate replace to="/login" />;

  // 1. Hook de Busca (Usando o que você enviou)
  const { data, isLoading } = useRoomInteractions(roomId);

  // Garantimos que interactions seja sempre um array para evitar o erro de .map
  const interactions = data ?? [];

  // 2. Hook de Criação
  const { mutateAsync: createInteraction } = useCreateInteraction(roomId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove o token de acesso
    navigate("/login"); // Redireciona para a tela de login
  };

  useEffect(() => {
    scrollToBottom();
  }, [interactions]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userPrompt = input.trim();
    setInput("");

    try {
      await createInteraction({ prompt: userPrompt });
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }
  };

  return (
    <main className="flex h-screen bg-[#0E0E10] text-zinc-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#171719] border-r border-zinc-800 transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <button className="flex items-center gap-3 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-zinc-700/50 mb-6">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Nova conversa</span>
          </button>
          <nav className="flex-1 overflow-y-auto space-y-2">
            <div className="text-xs font-semibold text-zinc-500 uppercase px-2 mb-2">
              Recentes
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-zinc-400 text-sm truncate">
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              Chat Gemini
            </button>
          </nav>

          {/* RODAPÉ: Botão de Sair */}
          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA DO CHAT */}
      <section className="flex-1 flex flex-col relative h-full">
        <header className="flex items-center px-4 py-3 border-b border-zinc-800 lg:hidden bg-[#0E0E10]">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Estado de Carregamento Inicial */}
            {isLoading && interactions.length === 0 && (
              <div className="h-full flex items-center justify-center text-zinc-500 animate-pulse">
                Carregando histórico...
              </div>
            )}

            {/* Lista de Mensagens */}
            {interactions.map((inter) => (
              <div key={inter.id} className="flex flex-col gap-6">
                {/* Pergunta do Usuário */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-[#2F2F32] rounded-2xl px-4 py-2.5 text-[15px]">
                    {inter.prompt}
                  </div>
                </div>

                {/* Resposta do Gemini */}
                <div className="flex justify-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    {/* Se não houver resposta e for uma nova interação (optimistic update) */}
                    {inter.response === null ? (
                      <div className="flex gap-1.5 py-3">
                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
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
        </div>

        {/* INPUT FORM */}
        <div className="p-4 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10] to-transparent">
          <form
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto relative group"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Pergunte ao Gemini..."
              className="w-full bg-[#1E1E21] border border-zinc-700/50 rounded-2xl pl-5 pr-14 py-4 focus:ring-1 focus:ring-zinc-600 outline-none text-zinc-100 resize-none min-h-[60px]"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-3 bottom-3 p-2 bg-zinc-100 text-black rounded-xl hover:bg-white disabled:opacity-10 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </main>
  );
}
