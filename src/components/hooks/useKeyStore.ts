import { create } from "zustand";
import { KeyRecord } from "@/types/keys";
import * as store from "@/lib/keyStore";

interface KeyState {
    records: KeyRecord[];
    refresh: () => void;
    checkout: (data: {
        lockerNumber: string;
        employeeName: string;
        sector: string;
        deliveredBy: string;
    }) => void;
    returnKey: (id: string, receivedBy: string) => void;
    inUseCount: number;
    availableCount: number;
    availableLockers: string[];
}

export const useKeyStore = create<KeyState>((set) => ({
    records: store.getRecords(),
    inUseCount: store.getInUseCount(),
    availableCount: store.getAvailableCount(),
    availableLockers: store.getAvailableLockers(),
    refresh: () =>
        set({
            records: store.getRecords(),
            inUseCount: store.getInUseCount(),
            availableCount: store.getAvailableCount(),
            availableLockers: store.getAvailableLockers(),
        }),
    checkout: (data) => {
        store.addCheckout(data);
        set({
            records: store.getRecords(),
            inUseCount: store.getInUseCount(),
            availableCount: store.getAvailableCount(),
            availableLockers: store.getAvailableLockers(),
        });
    },
    returnKey: (id, receivedBy) => {
        store.returnKey(id, receivedBy);
        set({
            records: store.getRecords(),
            inUseCount: store.getInUseCount(),
            availableCount: store.getAvailableCount(),
            availableLockers: store.getAvailableLockers(),
        });
    },
}));
