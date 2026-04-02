export type UserRole = "admin" | "student";
export type SubscriptionType = "free" | "paid";

export interface User {
    id?: string;
    email: string;
    role: UserRole;
    subscription: SubscriptionType;
    name: string;
    created_at?: string;
}