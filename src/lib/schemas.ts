import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(3, 'Name must be at least 3 characters')
    .max(80, 'Name is too long'),

  matricNumber: z
    .string({ required_error: 'Matric number is required' })
    .regex(
      /^\d{4}\/\d{6}$/,
      'Must be in the format YYYY/NNNNNN (e.g. 2021/249011)'
    ),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Enter a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),

  confirmPassword: z
    .string({ required_error: 'Please confirm your password' }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Enter a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type RegisterSchema = typeof registerSchema;
export type LoginSchema   = typeof loginSchema;