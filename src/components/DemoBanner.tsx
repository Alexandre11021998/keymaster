import { Info } from "lucide-react";

export function DemoBanner() {
    return (
        <div className="bg-accent/80 border-b border-accent text-accent-foreground px-4 py-2 flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 shrink-0" />
            <span>
                <strong>Modo de Demonstração:</strong> Você está logado como
                visitante para explorar as funcionalidades.
            </span>
        </div>
    );
}
