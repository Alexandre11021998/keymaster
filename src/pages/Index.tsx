import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";
import { CheckoutForm } from "@/components/CheckoutForm";
import { ActiveKeysView } from "@/components/ActiveKeysView";
import { ReportsView } from "@/components/ReportsView";
import { UsersView } from "@/components/UsersView";
import { LoginPage } from "@/components/LoginPage";
import { useAuth } from "@/hooks/useAuth";

type Tab = "dashboard" | "checkout" | "active" | "reports" | "users";

const Index = () => {
    const [tab, setTab] = useState<Tab>("dashboard");
    const { user, displayName, isAdmin, isDemoMode, loading, login, logout } =
        useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginPage onLogin={login} />;
    }

    return (
        <AppShell
            activeTab={tab}
            onTabChange={setTab}
            displayName={displayName}
            isAdmin={isAdmin}
            isDemoMode={isDemoMode}
            onLogout={logout}
        >
            {tab === "dashboard" && <DashboardView />}
            {tab === "checkout" && <CheckoutForm operatorName={displayName} />}
            {tab === "active" && <ActiveKeysView operatorName={displayName} />}
            {tab === "reports" && <ReportsView />}
            {tab === "users" && isAdmin && <UsersView />}
        </AppShell>
    );
};

export default Index;
