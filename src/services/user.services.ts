import { CreateUserModel } from "../models/user-request.models";
import { UserResponse } from "../models/user-response.model";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

class UserService {
    async createUser(userData: CreateUserModel): Promise<UserResponse> {
        const user = await prisma.user.create({
            data: userData,
        })

        const userResponse: UserResponse = {
            id: user.id,
            name: user.name,
            whatsapp_number: user.whatsapp_number,
            address: user.address,
            role: user.role,
            email: user.email ?? '',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token: ''
        }

        return userResponse
    }

    async getAllUser(): Promise<UserResponse[]> {
        const users = await prisma.user.findMany({
            where: {
                role: 'USER'
            }
        })


        const userResponse = users.map((user) => ({
            id: user.id,
            name: user.name,
            whatsapp_number: user.whatsapp_number,
            address: user.address,
            role: user.role,
            email: user.email ?? '',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        })
        )

        return userResponse
    }

    async getUserById(id: number): Promise<UserResponse | null> {
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        })

        if (!user) return null;

        const userResponse: UserResponse = {
            id: user.id,
            name: user.name,
            whatsapp_number: user.whatsapp_number,
            address: user.address,
            role: user.role,
            email: user.email ?? '',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
        return userResponse
    }

}

export default new UserService()