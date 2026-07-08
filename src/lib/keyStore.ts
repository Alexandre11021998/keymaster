import { KeyRecord } from "@/types/keys";

// 20 lockers by default
export const TOTAL_LOCKERS = 200;

export const generateLockerNumbers = (): string[] => {
    return Array.from({ length: TOTAL_LOCKERS }, (_, i) =>
        String(i + 1).padStart(3, "0"),
    );
};

let records: KeyRecord[] = [];
let nextId = 1;

export const getRecords = (): KeyRecord[] => [...records];

export const addCheckout = (
    data: Omit<KeyRecord, "id" | "checkoutDate" | "status">,
): KeyRecord => {
    const record: KeyRecord = {
        ...data,
        id: String(nextId++),
        checkoutDate: new Date().toISOString(),
        status: "in_use",
    };
    records = [record, ...records];
    return record;
};

export const returnKey = (
    id: string,
    receivedBy: string,
): KeyRecord | undefined => {
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    records[idx] = {
        ...records[idx],
        returnDate: new Date().toISOString(),
        receivedBy,
        status: "available",
    };
    return records[idx];
};

export const getAvailableLockers = (): string[] => {
    const inUse = new Set(
        records.filter((r) => r.status === "in_use").map((r) => r.lockerNumber),
    );
    return generateLockerNumbers().filter((n) => !inUse.has(n));
};

export const getInUseCount = (): number =>
    records.filter((r) => r.status === "in_use").length;
export const getAvailableCount = (): number => TOTAL_LOCKERS - getInUseCount();
