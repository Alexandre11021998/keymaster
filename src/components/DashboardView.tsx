import { Key, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRegistros } from "@/hooks/useRegistros";

export function DashboardView() {
    const {
        inUseCount,
        availableCount,
        totalArmarios,
        pendentes,
        registros,
        loading,
    } = useRegistros();

    const pendingLong = pendentes.filter((r) => {
        const hours =
            (Date.now() - new Date(r.data_retirada).getTime()) / 3600000;
        return hours > 8;
    }).length;

    const stats = [
        {
            label: "Total de Armários",
            value: totalArmarios,
            icon: Key,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            label: "Disponíveis",
            value: availableCount,
            icon: CheckCircle,
            color: "text-success",
            bg: "bg-success/10",
        },
        {
            label: "Em Uso",
            value: inUseCount,
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning/10",
        },
        {
            label: "Pendentes (+8h)",
            value: pendingLong,
            icon: AlertTriangle,
            color: "text-destructive",
            bg: "bg-destructive/10",
        },
    ];

    const recentRecords = registros.slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    Dashboard
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Visão geral do status dos armários
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <Card key={s.label} className="border-none shadow-sm">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div
                                className={`h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center`}
                            >
                                <s.icon className={`h-6 w-6 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {s.value}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {s.label}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-sm">
                <CardContent className="p-5">
                    <h3 className="font-semibold text-foreground mb-4">
                        Atividade Recente
                    </h3>
                    {loading ? (
                        <p className="text-muted-foreground text-sm">
                            Carregando...
                        </p>
                    ) : recentRecords.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Nenhum registro ainda.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentRecords.map((r) => (
                                <div
                                    key={r.id}
                                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {r.numero_chave}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {r.funcionario_retirou}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {r.setor}
                                            </p>
                                        </div>
                                    </div>
                                    {!r.data_devolucao ? (
                                        <span className="text-xs font-semibold uppercase text-destructive">
                                            Pendente
                                        </span>
                                    ) : (
                                        <span className="text-xs font-semibold uppercase text-success">
                                            Devolvido
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
