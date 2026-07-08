import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations / supabase/client";

interface UserRecord {
    id: string;
    email: string;
    display_name: string;
    created_at: string;
}

export function UsersView() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        display_name: "",
        username: "",
        password: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const res = await supabase.functions.invoke("manage-users", {
            body: { action: "list" },
        });
        if (res.error) {
            toast.error("Erro ao carregar usuários.");
        } else {
            setUsers(res.data.users || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !form.display_name.trim() ||
            !form.username.trim() ||
            !form.password.trim()
        ) {
            toast.error("Preencha todos os campos.");
            return;
        }
        if (form.password.length < 6) {
            toast.error("A senha deve ter no mínimo 6 caracteres.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await supabase.functions.invoke("manage-users", {
                body: { action: "create", ...form },
            });
            if (res.data?.error) throw new Error(res.data.error);
            toast.success(`Usuário "${form.username}" criado com sucesso!`);
            setForm({ display_name: "", username: "", password: "" });
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Erro ao criar usuário.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            const res = await supabase.functions.invoke("manage-users", {
                body: { action: "delete", user_id: userId },
            });
            if (res.data?.error) throw new Error(res.data.error);
            toast.success("Usuário excluído.");
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Erro ao excluir usuário.");
        }
    };

    const extractUsername = (email: string) =>
        email.replace("@sistema.local", "");

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    Gestão de Usuários
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Cadastre e gerencie operadores do sistema
                </p>
            </div>

            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">
                                    Nome Completo
                                </Label>
                                <Input
                                    id="displayName"
                                    placeholder="Ex: João Silva"
                                    value={form.display_name}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            display_name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    Nome de Usuário
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="Ex: joao"
                                    value={form.username}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            username: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            password: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="gap-2"
                            disabled={submitting}
                        >
                            <UserPlus className="h-4 w-4" />
                            {submitting ? "Criando..." : "Cadastrar Usuário"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Criado em
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Ação
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Carregando...
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Nenhum usuário cadastrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((u) => {
                                        const isAdmin =
                                            u.email === "admin@sistema.local";
                                        return (
                                            <TableRow key={u.id}>
                                                <TableCell className="font-medium">
                                                    {u.display_name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {extractUsername(u.email)}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                                                    {new Date(
                                                        u.created_at,
                                                    ).toLocaleDateString(
                                                        "pt-BR",
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {isAdmin ? (
                                                        <span className="text-xs text-muted-foreground/50">
                                                            admin
                                                        </span>
                                                    ) : (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-destructive hover:text-destructive gap-1.5"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    Excluir
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Excluir
                                                                        usuário?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        O
                                                                        usuário
                                                                        "
                                                                        {
                                                                            u.display_name
                                                                        }
                                                                        " será
                                                                        removido
                                                                        permanentemente.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancelar
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                u.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Sim,
                                                                        excluir
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
