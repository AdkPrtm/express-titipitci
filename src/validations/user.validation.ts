import { z } from "zod";

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
        whatsapp_number: z
            .string()
            .regex(/^\+\d{1,3}\d{10,12}$/, "Invalid WhatsApp number format. Use international format (e.g., +628456789012)"),

        address: z.string().min(5, "Address must be at least 5 characters").max(200, "Address is too long"),

        role: z.enum(["ADMIN", "USER", "CASHIER"], {
            errorMap: () => ({ message: "Role must be either ADMIN, USER, or CASHIER" }),
        }),

        email: z
            .string()
            .email("Invalid email format")
            .toLowerCase()
            .trim()
            .optional(),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password is too long")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
            .optional(),
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
});