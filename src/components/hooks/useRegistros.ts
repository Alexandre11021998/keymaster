import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RegistroChave {
    id: string;
    numero_chave: string;
    funcionario_retirou: string;
    setor: string;
    responsavel_entrega: string;
    data_retirada: string;
    data_devolucao: string | null;
    responsavel_recebimento: string | null;
}

const TOTAL_ARMARIOS = 200;

export function useRegistros() {
    const [registros, setRegistros] = useState<RegistroChave[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRegistros = useCallback(async () => {
        const { data, error } = await supabase
            .from("registros_chaves")
            .select("*")
            .order("data_retirada", { ascending: false });
        if (!error && data) setRegistros(data as RegistroChave[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchRegistros();

        const channel = supabase
            .channel("registros_realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "registros_chaves" },
                () => {
                    fetchRegistros();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchRegistros]);

    const pendentes = registros.filter((r) => !r.data_devolucao);
    const inUseCount = pendentes.length;
    const availableCount = TOTAL_ARMARIOS - inUseCount;

    const checkout = async (data: {
        numero_chave: string;
        funcionario_retirou: string;
        setor: string;
        responsavel_entrega: string;
    }) => {
        const { error } = await supabase.from("registros_chaves").insert(data);
        if (error) throw error;
    };

    const devolver = async (id: string, responsavel_recebimento: string) => {
        const { error } = await supabase
            .from("registros_chaves")
            .update({
                data_devolucao: new Date().toISOString(),
                responsavel_recebimento,
            })
            .eq("id", id);
        if (error) throw error;
    };

    const isLockerPendente = (numero: string) =>
        pendentes.some(
            (r) => r.numero_chave.toUpperCase() === numero.toUpperCase(),
        );

    return {
        registros,
        pendentes,
        loading,
        inUseCount,
        availableCount,
        checkout,
        devolver,
        isLockerPendente,
        totalArmarios: TOTAL_ARMARIOS,
    };
}
