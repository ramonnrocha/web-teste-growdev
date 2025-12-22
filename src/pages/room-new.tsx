import { useEffect, useRef } from "react";
import { useState } from "react";
import { Send, Plus, Menu, X } from "lucide-react";

export function RoomNew() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mockConversations = [
    "Como criar um app React?",
    "Diferença entre let e const",
    "Tailwind CSS best practices",
    "Next.js App Router",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Esta é uma resposta simulada. Em produção, aqui seria integrado com uma API de IA.",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSidebarOpen(false);
  };

  return (
    <main className="flex h-screen bg-background">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Conversas</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-accent rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova conversa
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {mockConversations.map((conv, idx) => (
              <button
                key={idx}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-accent text-sm text-foreground transition-colors"
              >
                {conv}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="text-sm text-muted-foreground truncate">
              {userEmail}
            </div>
            <button
              onClick={() => setUserEmail(null)}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Chat IA</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Como posso ajudar?
                </h2>
                <p className="text-muted-foreground">
                  Inicie uma conversa digitando uma mensagem abaixo
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 bg-card">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Digite sua mensagem..."
                rows={1}
                className="flex-1 resize-none bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground max-h-32"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
