import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, AlertCircle, Shield, Mail, ArrowRight, Monitor } from 'lucide-react';
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

  // Properly check if an email was saved in localStorage from a previous Remember Me
  const savedEmail = (() => {
    try {
      return localStorage.getItem('ebms_remembered_email') || '';
    } catch {
      return '';
    }
  })();

  // Checked state is true ONLY if a saved email actually exists in localStorage
  const [rememberMe, setRememberMe] = useState<boolean>(Boolean(savedEmail));

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: savedEmail || 'demo@ebms.local',
      password: 'Demo@2026!',
    },
  });

  const handleDemoFill = () => {
    setValue('email', 'demo@ebms.local', { shouldValidate: true });
    setValue('password', 'Demo@2026!', { shouldValidate: true });
    toast.info('Loaded demo account credentials into login fields.');
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      if (rememberMe) {
        try {
          localStorage.setItem('ebms_remembered_email', values.email);
        } catch {}
      } else {
        try {
          localStorage.removeItem('ebms_remembered_email');
        } catch {}
      }

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
    <div className="space-y-6 select-none">
      {/* Header Info */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
          Sign in to EBMS
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter your credentials to access your commercial workspace
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
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="demo@ebms.local"
              autoComplete="email"
              error={Boolean(errors.email)}
              className="pl-9"
              {...register('email')}
            />
          </div>
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          required
          error={errors.password?.message}
        >
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              error={Boolean(errors.password)}
              className="pl-9 pr-10"
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
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-ring/20 accent-primary cursor-pointer"
            />
            <span>Remember Me</span>
          </label>
          <span className="text-muted-foreground text-xs hover:underline cursor-pointer" onClick={() => toast.info('Contact system admin to reset password.')}>
            Forgot password? Contact admin
          </span>
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          className="w-full h-10 text-sm font-semibold flex items-center justify-center space-x-2"
          isLoading={isSubmitting}
        >
          <ArrowRight className="h-4 w-4" />
          <span>Sign In to EBMS</span>
        </Button>
      </form>

      {/* Interactive Quick Demo Callout Box */}
      <div
        onClick={handleDemoFill}
        className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between cursor-pointer hover:bg-amber-500/20 transition-all duration-150 select-none group"
      >
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <Monitor className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-foreground group-hover:text-amber-800 dark:group-hover:text-amber-300">
              Demo Account Quick-Fill
            </p>
            <p className="text-[10px] text-muted-foreground">Click to load demo credentials</p>
          </div>
        </div>

        <div className="text-right text-[10px] font-mono space-y-0.5 border-l border-amber-500/20 pl-3">
          <p className="text-muted-foreground"><span className="font-semibold text-foreground">Email:</span> demo@ebms.local</p>
          <p className="text-muted-foreground"><span className="font-semibold text-foreground">Password:</span> Demo@2026!</p>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="flex items-center justify-center space-x-1.5 text-xs text-muted-foreground border-t border-border pt-4">
        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Authorized Personnel Access • Secure Session</span>
      </div>
    </div>
  );
};
