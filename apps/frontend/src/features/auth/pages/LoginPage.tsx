import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { useAuth } from '@/shared/hooks/useAuth';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { isApiBusinessError, isApiValidationError } from '@/shared/types/api.types';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Where to redirect after login (default: /dashboard)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      await login(values);
      toast.success('Logged in successfully.');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (isApiValidationError(err)) {
        err.errors.forEach((fieldError) => {
          if (fieldError.field === 'email' || fieldError.field === 'password') {
            setError(fieldError.field, { message: fieldError.message });
          } else {
            setGeneralError(fieldError.message);
          }
        });
      } else if (isApiBusinessError(err)) {
        setGeneralError(err.error.message);
        toast.error(err.error.message);
      } else {
        const errorMsg = 'An unexpected error occurred during login.';
        setGeneralError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Sign In</h2>
        <p className="text-xs text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {generalError && (
        <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          label="Email Address"
          htmlFor="email"
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            autoComplete="email"
            error={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          required
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};
