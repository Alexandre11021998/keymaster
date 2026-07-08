import { useState, useMemo } from "react";
import { useRegistros, type RegistroChave } from "@/hooks/useRegistros";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Download, FileText, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Period = "daily" | "weekly" | "monthly" | "yearly" | "custom";
type StatusFilter = "all" | "returned" | "pending";

function getStartDate(period: Period): Date {
    const now = new Date();
    switch (period) {
        case "daily":
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        case "weekly": {
            const d = new Date(now);
            d.setDate(d.getDate() - 7);
            return d;
        }
        case "monthly":
            return new Date(now.getFullYear(), now.getMonth(), 1);
        case "yearly":
            return new Date(now.getFullYear(), 0, 1);
        case "custom":
            return new Date(2000, 0, 1);
    }
}

function formatDate(iso?: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function exportCSV(data: RegistroChave[]) {
    const headers =
        "Armário;Funcionário;Setor;Entregue por;Retirada;Devolução;Recebido por;Status\n";
    const rows = data
        .map(
            (r) =>
                `${r.numero_chave};${r.funcionario_retirou};${r.setor};${r.responsavel_entrega};${formatDate(r.data_retirada)};${formatDate(r.data_devolucao)};${r.responsavel_recebimento || "—"};${r.data_devolucao ? "Concluído" : "Em Aberto"}`,
        )
        .join("\n");
    const blob = new Blob([headers + rows], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-chaves-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export function ReportsView() {
    const { registros, loading } = useRegistros();
    const [period, setPeriod] = useState<Period>("daily");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [dateFrom, setDateFrom] = useState<Date | undefined>();
    const [dateTo, setDateTo] = useState<Date | undefined>();

    const filtered = useMemo(() => {
        let result = registros;

        // Date filtering
        if (period === "custom") {
            if (dateFrom) {
                const start = new Date(dateFrom);
                start.setHours(0, 0, 0, 0);
                result = result.filter(
                    (r) => new Date(r.data_retirada) >= start,
                );
            }
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                result = result.filter((r) => new Date(r.data_retirada) <= end);
            }
        } else {
            const start = getStartDate(period);
            result = result.filter((r) => new Date(r.data_retirada) >= start);
        }

        // Status filtering
        if (statusFilter === "returned") {
            result = result.filter((r) => r.data_devolucao !== null);
        } else if (statusFilter === "pending") {
            result = result.filter((r) => r.data_devolucao === null);
        }

        // Text search
        result = result.filter(
            (r) =>
                r.funcionario_retirou
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                r.numero_chave.includes(search),
        );

        return result;
    }, [registros, period, search, statusFilter, dateFrom, dateTo]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Relatórios
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        {filtered.length} registro(s) encontrados
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="gap-2 self-start"
                    onClick={() => exportCSV(filtered)}
                >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>

            {/* Status filter tabs */}
            <Tabs
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="returned">
                        Somente Devolvidos
                    </TabsTrigger>
                    <TabsTrigger value="pending">Somente Pendentes</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Select
                    value={period}
                    onValueChange={(v) => setPeriod(v as Period)}
                >
                    <SelectTrigger className="w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                </Select>

                {period === "custom" && (
                    <div className="flex gap-2 items-center flex-wrap">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[160px] justify-start text-left font-normal",
                                        !dateFrom && "text-muted-foreground",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFrom
                                        ? format(dateFrom, "dd/MM/yyyy")
                                        : "Início"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={dateFrom}
                                    onSelect={setDateFrom}
                                    locale={ptBR}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground text-sm">
                            até
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[160px] justify-start text-left font-normal",
                                        !dateTo && "text-muted-foreground",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateTo
                                        ? format(dateTo, "dd/MM/yyyy")
                                        : "Fim"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={dateTo}
                                    onSelect={setDateTo}
                                    locale={ptBR}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou nº armário"
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">
                                        Armário
                                    </TableHead>
                                    <TableHead>Funcionário</TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Setor
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Entregue por
                                    </TableHead>
                                    <TableHead>Retirada</TableHead>
                                    <TableHead>Devolução</TableHead>
                                    <TableHead className="hidden lg:table-cell">
                                        Recebido por
                                    </TableHead>
                                    <TableHead className="w-28">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Carregando...
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                            Nenhum registro no período
                                            selecionado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((r) => (
                                        <TableRow
                                            key={r.id}
                                            className={
                                                !r.data_devolucao
                                                    ? "bg-destructive/5"
                                                    : ""
                                            }
                                        >
                                            <TableCell className="font-mono font-bold text-primary">
                                                {r.numero_chave}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {r.funcionario_retirou}
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {r.setor}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {r.responsavel_entrega}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(r.data_retirada)}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(r.data_devolucao)}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                {r.responsavel_recebimento ||
                                                    "—"}
                                            </TableCell>
                                            <TableCell>
                                                {r.data_devolucao ? (
                                                    <span className="text-xs font-semibold uppercase text-success">
                                                        Devolvido
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold uppercase text-destructive">
                                                        Pendente
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
