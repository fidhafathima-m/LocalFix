export type UserType = 'user' | 'serviceProvider' | 'admin';
export type OTPContext = 'signup' | 'forgot';

export interface ValidationError {
  path: (string | number)[];
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}