export interface UserResponse {
    id: number,
    name: string;
    whatsapp_number: string;
    address: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string;
    token?: string;
}