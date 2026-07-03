import { useState } from "react";
import { useRegistros } from "@/hooks/useRegistros";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, RotateCcw } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ActiveKeysViewProps {
    operatorName: string;
}

export function ActiveKeysView({ operatorName }: ActiveKeysViewProps) {
    const { pendentes, devolver, loading } = useRegistros();
    const [search, setSearch] = useState("");
    const [returnDialog, setReturnDialog] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const filtered = pendentes.filter(
        (r) =>
            r.funcionario_retirou
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            r.numero_chave.includes(search),
    );

    const handleReturn = async () => {
        if (!returnDialog) return;
        setSubmitting(true);
        try {
            await devolver(returnDialog, operatorName);
            toast.success("Chave devolvida com sucesso!");
            setReturnDialog(null);
        } catch {
            toast.error("Erro ao registrar devolução.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const pendingRecord = returnDialog
        ? pendentes.find((r) => r.id === returnDialog)
        : null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    Chaves Pendentes
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    {filtered.length} chave(s) pendente(s) de devolução
                </p>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome ou nº armário"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
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
                                    <TableHead className="hidden lg:table-cell">
                                        Retirada
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
                                            colSpan={6}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Carregando...
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Nenhuma chave pendente.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((r) => (
                                        <TableRow key={r.id}>
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
                                            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                                                {formatDate(r.data_retirada)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5"
                                                    onClick={() =>
                                                        setReturnDialog(r.id)
                                                    }
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                    Devolver
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={!!returnDialog}
                onOpenChange={(o) => !o && setReturnDialog(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Devolução</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {pendingRecord && (
                            <p className="text-sm text-muted-foreground">
                                Devolver chave{" "}
                                <strong className="text-foreground">
                                    {pendingRecord.numero_chave}
                                </strong>{" "}
                                de{" "}
                                <strong className="text-foreground">
                                    {pendingRecord.funcionario_retirou}
                                </strong>
                                ?
                            </p>
                        )}
                        <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                            Recebido por:{" "}
                            <strong className="text-foreground">
                                {operatorName}
                            </strong>{" "}
                            (logado)
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReturnDialog(null)}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleReturn} disabled={submitting}>
                            {submitting ? "Salvando..." : "Confirmar Devolução"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
