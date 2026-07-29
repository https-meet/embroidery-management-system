import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, AlertCircle, Shield } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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
      {/* Header Info */}
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Sign In
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your email address and password to access your account
        </p>
      </div>

      {/* Error Alert Box */}
      {generalError && (
        <div className="flex items-start space-x-2.5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Form Credentials */}
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
            placeholder="admin@ebms.local"
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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              error={Boolean(errors.password)}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        {/* Remember Me & Help Link */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center space-x-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary/20 accent-primary"
            />
            <span>Remember Me</span>
          </label>
          <span className="text-muted-foreground text-[11px]">
            Forgot password? Contact Administrator
          </span>
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          className="w-full h-10 text-sm font-semibold flex items-center justify-center space-x-2"
          isLoading={isSubmitting}
        >
          <Lock className="h-4 w-4" />
          <span>Sign In to Dashboard</span>
        </Button>
      </form>

      {/* Generic Trust Footer */}
      <div className="flex items-center justify-center space-x-1.5 text-[11px] text-muted-foreground border-t border-border/40 pt-4">
        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Authorized Personnel Access • Secure Session</span>
      </div>
    </div>
  );
};

