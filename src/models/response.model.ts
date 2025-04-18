export interface ApiResponse<T> {
    message: string;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPage?: number;
    };
}