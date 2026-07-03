import { useState, useRef, useEffect, useMemo } from "react";
import { useRegistros } from "@/hooks/useRegistros";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

interface CheckoutFormProps {
    operatorName: string;
}

export function CheckoutForm({ operatorName }: CheckoutFormProps) {
    const { checkout, registros, isLockerPendente } = useRegistros();
    const [form, setForm] = useState({
        numero_chave: "",
        funcionario_retirou: "",
        setor: "",
    });

    const [sectorFocused, setSectorFocused] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const lockerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        lockerRef.current?.focus();
    }, []);

    const knownSectors = useMemo(() => {
        const set = new Set(registros.map((r) => r.setor).filter(Boolean));
        return Array.from(set).sort();
    }, [registros]);

    const sectorSuggestions = useMemo(() => {
        if (!form.setor.trim()) return [];
        return knownSectors.filter((s) =>
            s.toLowerCase().includes(form.setor.toLowerCase()),
        );
    }, [form.setor, knownSectors]);

    const handleLockerChange = (value: string) => {
        setForm((f) => ({ ...f, numero_chave: value.trim() }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.numero_chave || !form.funcionario_retirou || !form.setor) {
            toast.error("Preencha todos os campos.");
            return;
        }
        const padded = form.numero_chave.toUpperCase();

        if (isLockerPendente(padded)) {
            toast.error(`Armário ${padded} já está pendente (em uso).`);
            return;
        }

        setSubmitting(true);
        try {
            await checkout({
                ...form,
                numero_chave: padded,
                responsavel_entrega: operatorName,
            });
            toast.success(
                `Chave ${padded} registrada para ${form.funcionario_retirou}`,
            );
            setForm({ numero_chave: "", funcionario_retirou: "", setor: "" });
            lockerRef.current?.focus();
        } catch {
            toast.error("Erro ao salvar no banco de dados.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-foreground">
                    Registro de Retirada
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Registre a saída de uma chave de armário
                </p>
            </div>

            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="locker">
                                    Número do Armário
                                </Label>
                                <Input
                                    ref={lockerRef}
                                    id="locker"
                                    placeholder="Ex: 42, A1, 205"
                                    value={form.numero_chave}
                                    onChange={(e) =>
                                        handleLockerChange(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <Label htmlFor="sector">Setor</Label>
                                <Input
                                    id="sector"
                                    placeholder="Digite o setor"
                                    value={form.setor}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            setor: e.target.value,
                                        }))
                                    }
                                    onFocus={() => setSectorFocused(true)}
                                    onBlur={() =>
                                        setTimeout(
                                            () => setSectorFocused(false),
                                            150,
                                        )
                                    }
                                    autoComplete="off"
                                />
                                {sectorFocused &&
                                    sectorSuggestions.length > 0 &&
                                    form.setor.trim() && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-y-auto">
                                            {sectorSuggestions.map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setForm((f) => ({
                                                            ...f,
                                                            setor: s,
                                                        }));
                                                        setSectorFocused(false);
                                                    }}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employee">
                                Nome do Funcionário
                            </Label>
                            <Input
                                id="employee"
                                placeholder="Nome completo do funcionário"
                                value={form.funcionario_retirou}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        funcionario_retirou: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                            Responsável pela entrega:{" "}
                            <strong className="text-foreground">
                                {operatorName}
                            </strong>{" "}
                            (logado)
                        </div>

                        <Button
                            type="submit"
                            className="w-full sm:w-auto gap-2"
                            disabled={submitting}
                        >
                            <KeyRound className="h-4 w-4" />
                            {submitting ? "Salvando..." : "Registrar Retirada"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
