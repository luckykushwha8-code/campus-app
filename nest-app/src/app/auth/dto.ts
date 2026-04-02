export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  collegeId?: string;
  collegeName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
