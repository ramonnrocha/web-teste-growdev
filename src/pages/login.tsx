import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/http/use-login";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { mutateAsync: login, isPending } = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    try {
      const { roomId } = await login({ email });

      localStorage.setItem("roomId", roomId);
      console.log("roomId", roomId);
      // Token já é armazenado automaticamente no hook via onSuccess
      navigate("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Falha ao realizar login";
      alert(errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-bold text-3xl text-foreground">
              Bem-vindo
            </h1>
            <p className="text-muted-foreground">
              Entre com seu email para continuar
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                className="mb-2 block font-medium text-foreground text-sm"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                type="email"
                value={email}
              />
            </div>

            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
