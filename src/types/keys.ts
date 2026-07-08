export interface KeyRecord {
    id: string;
    lockerNumber: string;
    employeeName: string;
    sector: string;
    deliveredBy: string;
    checkoutDate: string;
    returnDate?: string;
    receivedBy?: string;
    status: "in_use" | "available";
}
