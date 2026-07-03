import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, LogIn } from "lucide-react";
import { toast } from "sonner";

interface LoginPageProps {
    onLogin: (usuario: string, senha: string) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario.trim() || !senha.trim()) {
            toast.error("Preencha usuário e senha.");
            return;
        }
        setLoading(true);
        try {
            await onLogin(usuario.trim(), senha.trim());
        } catch {
            toast.error("Usuário ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="text-center space-y-3 pb-2">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
                        <Key className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">
                        Gestão de Armários
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Faça login para acessar o sistema
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="usuario">Usuário</Label>
                            <Input
                                id="usuario"
                                placeholder="Digite seu usuário"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <Input
                                id="senha"
                                type="password"
                                placeholder="Digite sua senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full gap-2"
                            disabled={loading}
                        >
                            <LogIn className="h-4 w-4" />
                            {loading ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
