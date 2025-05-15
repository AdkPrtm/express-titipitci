export interface UserResponse {
  id: number;
  name: string;
  whatsapp_number: string;
  address: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  email?: string;
}

export interface UserPaginationResponse {
  user: UserResponse[];
  next_cursor: number;
  total_pages: number;
  max_cursor: number;
  has_next_page: boolean;
}