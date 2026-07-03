import { useState } from "react";
import {
    Key,
    ClipboardList,
    BarChart3,
    Menu,
    Trash2,
    LogOut,
    User,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/DemoBanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

type Tab = "dashboard" | "checkout" | "active" | "reports" | "users";

interface AppShellProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    children: React.ReactNode;
    displayName: string;
    isAdmin: boolean;
    isDemoMode: boolean;
    onLogout: () => void;
}

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "checkout", label: "Retirada", icon: Key },
    { id: "active", label: "Chaves em Uso", icon: ClipboardList },
    { id: "reports", label: "Relatórios", icon: BarChart3 },
];

export function AppShell({
    activeTab,
    onTabChange,
    children,
    displayName,
    isAdmin,
    isDemoMode,
    onLogout,
}: AppShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const allNavItems = isAdmin
        ? [...navItems, { id: "users" as Tab, label: "Usuários", icon: Users }]
        : navItems;

    return (
        <div className="min-h-screen flex flex-col">
            {isDemoMode && <DemoBanner />}
            {/* Header */}
            <header className="h-16 bg-primary flex items-center px-4 md:px-6 gap-4 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-primary-foreground hover:bg-sidebar-accent"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                        <Key className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                        <h1 className="text-primary-foreground font-semibold text-lg leading-tight">
                            Gestão de Armários
                        </h1>
                        <p className="text-primary-foreground/60 text-xs hidden sm:block">
                            Sistema de controle de chaves
                        </p>
                    </div>
                </div>

                {/* User info - right side */}
                <div className="ml-auto flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-primary-foreground/80 text-sm">
                        <User className="h-4 w-4" />
                        <span>
                            Logado como:{" "}
                            <strong className="text-primary-foreground">
                                {displayName}
                            </strong>
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1.5"
                        onClick={onLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Sair</span>
                    </Button>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "w-56 bg-primary border-r border-sidebar-border shrink-0 flex flex-col transition-all",
                        "fixed md:static top-16 bottom-0 left-0 z-30",
                        mobileOpen
                            ? "translate-x-0"
                            : "-translate-x-full md:translate-x-0",
                    )}
                >
                    <nav className="flex-1 py-4 px-3 space-y-1">
                        {allNavItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onTabChange(item.id);
                                    setMobileOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    activeTab === item.id
                                        ? "bg-sidebar-accent text-sidebar-primary"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Reset button */}
                    <div className="px-3 py-4 border-t border-sidebar-border">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-sidebar-foreground/40 hover:text-destructive hover:bg-sidebar-accent/50 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Limpar todos os dados
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Limpar todos os dados?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação é irreversível. Todos os
                                        registros de chaves serão excluídos
                                        permanentemente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={async () => {
                                            const { error } = await supabase
                                                .from("registros_chaves")
                                                .delete()
                                                .neq(
                                                    "id",
                                                    "00000000-0000-0000-0000-000000000000",
                                                );
                                            if (error) {
                                                toast.error(
                                                    "Erro ao limpar dados.",
                                                );
                                            } else {
                                                toast.success(
                                                    "Todos os dados foram removidos.",
                                                );
                                            }
                                        }}
                                    >
                                        Sim, limpar tudo
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </aside>

                {/* Overlay */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 bg-foreground/20 z-20 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Main */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto flex flex-col">
                    <div className="flex-1">{children}</div>
                    <footer className="pt-8 pb-4 text-center">
                        <p className="text-[11px] tracking-wide text-muted-foreground/50">
                            © 2026 Key Master — Desenvolvido por Alexandre
                            Costa. Todos os direitos reservados.
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}
