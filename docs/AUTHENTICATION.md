# Authentication Guide: Expo + Supabase

This guide provides a comprehensive, production-ready implementation of authentication for Expo apps using Supabase. It covers architecture, security best practices, and complete code examples integrated with your existing Expo Router, TypeScript, NativeWind, and shadcn/ui setup.

---

## 1. Architecture Overview

### Why Supabase for Authentication?

Supabase provides a robust, production-ready authentication system with:

- **Built-in providers**: Email/password, OAuth (Google, GitHub, Apple), and magic link login
- **Secure session management**: Automatic token refresh and session persistence
- **Row-level security (RLS)**: Database-level access control
- **Audit logging**: Track authentication events
- **Email templates**: Customizable verification and password reset emails
- **Scalability**: Handles millions of users without infrastructure management

### Expo Integration Patterns

This guide uses the **service layer pattern**:

```
┌─────────────────────────────────────────────────────────────┐
│                        Expo Router                          │
│  (Auth screens: signin, signup, verify, reset-password)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Auth Service Layer                       │
│  (Centralized auth logic, error handling, session mgmt)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Client                          │
│  (Low-level SDK with SecureStorage integration)              │
└─────────────────────────────────────────────────────────────┘
```

### Security Considerations for Mobile Apps

1. **Token Storage**: Use `expo-secure-store` instead of `AsyncStorage` for production
2. **Environment Variables**: Never hardcode secrets; use Expo config plugins
3. **Rate Limiting**: Implement client-side rate limiting to prevent brute force
4. **Input Validation**: Validate all user inputs with Zod schemas
5. **Session Management**: Implement session expiration checks
6. **HTTPS Only**: Ensure all requests use HTTPS in production
7. **Input Sanitization**: Sanitize user inputs to prevent XSS attacks
8. **CSRF Protection**: Use Supabase's built-in CSRF protection

---

## 2. Prerequisites

### Supabase Project Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your credentials**:
   - Project URL: Found in Project Settings → API
   - anon/public key: Found in Project Settings → API
   - service_role key: Found in Project Settings → API (server-side only)

3. **Configure authentication settings**:
   - Enable Email/Password provider
   - Enable Email Confirmations (for verification)
   - Configure password strength requirements
   - Set up email templates (verification, recovery, magic link)

4. **Set up Row Level Security (RLS)** for the `users` table:
   ```sql
   -- Enable RLS
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

   -- Allow users to view their own profile
   CREATE POLICY "Users can view own profile"
     ON auth.users FOR SELECT
     USING (auth.uid() = id);

   -- Allow users to update their own profile
   CREATE POLICY "Users can update own profile"
     ON auth.users FOR UPDATE
     USING (auth.uid() = id);

   -- Allow public to insert users (when email verified)
   CREATE POLICY "Enable insert for authenticated users"
     ON auth.users FOR INSERT
     WITH CHECK (auth.uid() = id);
   ```

### Environment Variable Configuration

Create `.env` files in your project root:

**`.env.development`**:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLIC_KEY=your-anon-public-key
EXPO_PUBLIC_ENABLE_DEBUG=true
```

**`.env.production`**:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLIC_KEY=your-anon-public-key
EXPO_PUBLIC_ENABLE_DEBUG=false
```

> **Important**: The `service_role` key should **never** be exposed to the client. Use it only in server-side functions or serverless functions.

### Required Dependencies

The project already has:
```json
{
  "@supabase/supabase-js": "^2.112.3",
  "@react-native-async-storage/async-storage": "2.2.0"
}
```

Add these additional dependencies:
```bash
pnpm add expo-secure-store zod
pnpm add -D @types/react-native-secure-store
```

---

## 3. Step-by-Step Implementation

### A. Environment Setup

#### Configure Environment Variables

Create `lib/env.ts` for type-safe environment variable access:

```typescript
// lib/env.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { config } from './config';

const isDev = __DEV__ || Platform.OS === 'web';

export const env = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    publicKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY,
  },
  debug: isDev && process.env.EXPO_PUBLIC_ENABLE_DEBUG === 'true',
} as const;

// Validate required environment variables
if (!env.supabase.url) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!env.supabase.publicKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_PUBLIC_KEY environment variable');
}
```

> **Note**: For production, consider using Expo Config Plugins for more secure environment variable management.

### B. Core Services

#### 1. Supabase Client with Secure Storage

Update `lib/supabase.ts` to use `expo-secure-store`:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { env } from './env';

// Use SecureStore in production, AsyncStorage in web/dev for easier debugging
const storage = Platform.OS === 'web' 
  ? {
      getItem: async (key: string) => {
        const value = await SecureStore.getItemAsync(key);
        return value ?? null;
      },
      setItem: async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value);
      },
      removeItem: async (key: string) => {
        await SecureStore.deleteItemAsync(key);
      },
    }
  : {
      getItem: async (key: string) => {
        const value = await SecureStore.getItemAsync(key);
        return value ?? null;
      },
      setItem: async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value);
      },
      removeItem: async (key: string) => {
        await SecureStore.deleteItemAsync(key);
      },
    };

export const createSupabaseClient = () => {
  if (!env.supabase.url) {
    throw new Error('Missing Supabase URL');
  }

  if (!env.supabase.publicKey) {
    throw new Error('Missing Supabase public key');
  }

  const supabase = createClient(env.supabase.url, env.supabase.publicKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabase;
};

// Create a singleton instance
const supabaseClient = createSupabaseClient();

export { supabaseClient };
```

#### 2. Auth Service Layer

Create `services/auth.ts` with comprehensive error handling:

```typescript
// services/auth.ts
import { supabaseClient } from '@/lib/supabase';
import { env } from '@/lib/env';
import { z } from 'zod';

// ==================== Zod Schemas ====================
const emailSchema = z.string().email('Please enter a valid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  email: emailSchema,
});

const updatePasswordSchema = z.object({
  password: passwordSchema,
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

// ==================== Types ====================
export type User = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
};

export type AuthError = {
  message: string;
  status?: number;
  details?: unknown;
};

export type AuthState = {
  user: User | null;
  session: {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  };
  isLoading: boolean;
  error: AuthError | null;
};

// ==================== Auth Service ====================
export class AuthService {
  private constructor() {}

  static async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      throw this.mapSupabaseError(error);
    }

    if (!data.user) {
      throw new Error('Invalid credentials');
    }

    return this.mapUser(data.user);
  }

  static async signUpWithEmailAndPassword(
    email: string,
    password: string,
    fullName: string
  ): Promise<User> {
    const result = signUpSchema.safeParse({ email, password, fullName });
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          full_name: result.data.fullName,
        },
        emailRedirectTo: `${config.site.url}/auth/verify`,
      },
    });

    if (error) {
      throw this.mapSupabaseError(error);
    }

    if (!data.user) {
      throw new Error('Failed to create account');
    }

    return this.mapUser(data.user);
  }

  static async signOut(): Promise<void> {
    const { error } = await supabaseClient.auth.signOut({
      scope: 'local',
    });

    if (error) {
      throw this.mapSupabaseError(error);
    }
  }

  static async resetPassword(email: string): Promise<void> {
    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      result.data.email,
      {
        redirectTo: `${config.site.url}/auth/reset-password`,
      }
    );

    if (error) {
      throw this.mapSupabaseError(error);
    }
  }

  static async updatePassword(password: string): Promise<void> {
    const result = updatePasswordSchema.safeParse({ password });
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    const { error } = await supabaseClient.auth.updateUser({
      password: result.data.password,
    });

    if (error) {
      throw this.mapSupabaseError(error);
    }
  }

  static async updateProfile(data: {
    fullName?: string;
    avatarUrl?: string | null;
  }): Promise<User> {
    const result = updateProfileSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    const { data: userData, error } = await supabaseClient.auth.updateUser(
      result.data
    );

    if (error) {
      throw this.mapSupabaseError(error);
    }

    if (!userData.user) {
      throw new Error('Failed to update profile');
    }

    return this.mapUser(userData.user);
  }

  static async getUser(): Promise<User | null> {
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error) {
      if (env.debug) {
        console.error('Error fetching user:', error);
      }
      return null;
    }

    return user ? this.mapUser(user) : null;
  }

  static async refreshSession(): Promise<void> {
    const { error } = await supabaseClient.auth.refreshSession();

    if (error) {
      throw this.mapSupabaseError(error);
    }
  }

  static async onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): Promise<Subscription> {
    return supabaseClient.auth.onAuthStateChange(callback);
  }

  static async setEmailForPasswordReset(email: string): Promise<void> {
    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      result.data.email
    );

    if (error) {
      throw this.mapSupabaseError(error);
    }
  }

  // ==================== Helper Methods ====================
  private static mapUser(user: import('@supabase/supabase-js').User): User {
    return {
      id: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      emailVerified: user.email_confirmed_at !== null,
      createdAt: user.created_at,
    };
  }

  private static mapSupabaseError(
    error: import('@supabase/supabase-js').AuthError
  ): AuthError {
    const errorMap: Record<string, string> = {
      EmailNotConfirmed: 'Please verify your email address',
      InvalidLoginCredentials: 'Invalid email or password',
      InvalidEmail: 'Invalid email address',
      PasswordTooShort: 'Password must be at least 6 characters',
      PasswordTooLong: 'Password must be less than 128 characters',
      PasswordMissing: 'Password is required',
      UserAlreadyExists: 'An account with this email already exists',
      SessionExpired: 'Your session has expired. Please sign in again.',
    };

    return {
      message: errorMap[error.message] ?? error.message,
      status: error.status,
      details: error.details,
    };
  }
}

// ==================== Utility Types ====================
type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: import('@supabase/supabase-js').User;
}

interface Subscription {
  unsubscribe: () => void;
}
```

#### 3. Session Management

Create `lib/session.ts` for centralized session handling:

```typescript
// lib/session.ts
import { AuthService } from '@/services/auth';
import { User } from '@/services/auth';

export class SessionManager {
  private static instance: SessionManager;
  private user: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      const user = await AuthService.getUser();
      this.setUser(user);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }

  async refresh(): Promise<void> {
    try {
      await AuthService.refreshSession();
      const user = await AuthService.getUser();
      this.setUser(user);
    } catch (error) {
      console.error('Failed to refresh session:', error);
      this.setUser(null);
    }
  }

  onAuthChange(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private setUser(user: User | null): void {
    this.user = user;
    this.listeners.forEach((listener) => listener(user));
  }

  getUser(): User | null {
    return this.user;
  }

  async signOut(): Promise<void> {
    try {
      await AuthService.signOut();
      this.setUser(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
      this.setUser(null);
    }
  }
}

export const sessionManager = SessionManager.getInstance();
```

### C. Authentication Flows

#### 1. Sign Up Screen

Create `app/(auth)/signup.tsx`:

```typescript
// app/(auth)/signup.tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import { useTranslations } from '@/i18n';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { AuthService } from '@/services/auth';
import { z } from 'zod';

export default function SignupScreen() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('At least one lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('At least one number');
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('At least one special character');
    return errors;
  };

  const passwordErrors = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSignUp = async () => {
    if (passwordErrors.length > 0 || !passwordsMatch) {
      Alert.alert('Validation Error', 'Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.signUpWithEmailAndPassword(email, password, fullName);
      Alert.alert(
        'Account Created',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 py-6">
      <View className="mt-8 flex-1 justify-center">
        <View className="mb-8 text-center">
          <Text className="text-3xl font-bold text-primary">Create Account</Text>
          <Text className="mt-2 text-muted-foreground">
            Join us to start learning languages
          </Text>
        </View>

        <View className="space-y-4">
          {/* Full Name */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Full Name</Text>
            <Textarea
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              className="h-12"
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <Textarea
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              className="h-12"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Password</Text>
            <View className="relative">
              <Textarea
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                className="h-12 pr-10"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  as={showPassword ? 'Eye' : 'EyeOff'}
                  className="size-4 text-muted-foreground"
                />
              </Button>
            </View>

            {/* Password Requirements */}
            {password.length > 0 && (
              <View className="mt-2 space-y-1 rounded-md bg-muted/50 p-3">
                <Text className="text-xs font-medium text-muted-foreground">
                  Password must contain:
                </Text>
                {[
                  { label: 'At least 8 characters', valid: password.length >= 8 },
                  { label: 'At least one uppercase letter', valid: /[A-Z]/.test(password) },
                  { label: 'At least one lowercase letter', valid: /[a-z]/.test(password) },
                  { label: 'At least one number', valid: /[0-9]/.test(password) },
                  { label: 'At least one special character', valid: /[^A-Za-z0-9]/.test(password) },
                ].map((req, idx) => (
                  <View key={idx} className="flex-row items-start gap-2">
                    <Icon
                      as={req.valid ? 'CheckCircle' : 'Circle'}
                      className={`mt-0.5 size-4 ${req.valid ? 'text-green-500' : 'text-muted-foreground'}`}
                    />
                    <Text className={`text-xs ${req.valid ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Confirm Password</Text>
            <Textarea
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              className="h-12"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            {!passwordsMatch && confirmPassword.length > 0 && (
              <Text className="text-xs text-destructive">
                Passwords do not match
              </Text>
            )}
          </View>

          {/* Sign Up Button */}
          <Button
            className="mt-4"
            disabled={isLoading || passwordErrors.length > 0 || !passwordsMatch}
            onPress={handleSignUp}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <Icon as="Loader2" className="size-4 animate-spin" />
                <Text>Creating Account...</Text>
              </View>
            ) : (
              <Text>Create Account</Text>
            )}
          </Button>

          {/* Sign In Link */}
          <View className="flex-row justify-center gap-2">
            <Text className="text-sm text-muted-foreground">
              Already have an account?{' '}
            </Text>
            <Link href="/auth" asChild>
              <Text className="text-sm font-semibold text-primary hover:underline">
                Sign In
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
```

#### 2. Sign In Screen

Update `app/(auth)/signin.tsx`:

```typescript
// app/(auth)/signin.tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import { useTranslations } from '@/i18n';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { AuthService } from '@/services/auth';

export default function SigninScreen() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.signInWithEmailAndPassword(email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/reset-password');
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 py-6">
      <View className="mt-8 flex-1 justify-center">
        <View className="mb-8 text-center">
          <Text className="text-3xl font-bold text-primary">Welcome Back</Text>
          <Text className="mt-2 text-muted-foreground">
            Sign in to continue learning
          </Text>
        </View>

        <View className="space-y-4">
          {/* Email */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <Textarea
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              className="h-12"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm font-medium text-foreground">Password</Text>
              <Link
                href="/auth/reset-password"
                asChild
              >
                <Text className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Text>
              </Link>
            </View>
            <View className="relative">
              <Textarea
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                className="h-12 pr-10"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  as={showPassword ? 'Eye' : 'EyeOff'}
                  className="size-4 text-muted-foreground"
                />
              </Button>
            </View>
          </View>

          {/* Sign In Button */}
          <Button
            className="mt-4"
            disabled={isLoading}
            onPress={handleSignIn}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <Icon as="Loader2" className="size-4 animate-spin" />
                <Text>Signing In...</Text>
              </View>
            ) : (
              <Text>Sign In</Text>
            )}
          </Button>

          {/* Sign Up Link */}
          <View className="flex-row justify-center gap-2">
            <Text className="text-sm text-muted-foreground">
              Don't have an account?{' '}
            </Text>
            <Link href="/auth/signup" asChild>
              <Text className="text-sm font-semibold text-primary hover:underline">
                Sign Up
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
```

#### 3. Password Reset Flow

Create `app/(auth)/reset-password.tsx`:

```typescript
// app/(auth)/reset-password.tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/i18n';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { AuthService } from '@/services/auth';

export default function ResetPasswordScreen() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.resetPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <View className="w-full max-w-md rounded-2xl bg-card p-8 shadow-sm">
          <View className="mb-6 flex-row justify-center">
            <View className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Text className="text-3xl">📧</Text>
            </View>
          </View>
          <Text className="text-2xl font-bold text-center text-foreground mb-4">
            Check Your Email
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            We've sent a password reset link to {email}. Please check your inbox
            and click the link to reset your password.
          </Text>
          <Button onPress={() => router.replace('/auth')}>
            <Text>Back to Sign In</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-4 py-6">
      <View className="mt-8 flex-1 justify-center">
        <View className="mb-8 text-center">
          <Text className="text-3xl font-bold text-primary">Reset Password</Text>
          <Text className="mt-2 text-muted-foreground">
            Enter your email to receive a reset link
          </Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <Textarea
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              className="h-12"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>

          <Button
            className="mt-4"
            disabled={isLoading}
            onPress={handleResetPassword}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <Icon as="Loader2" className="size-4 animate-spin" />
                <Text>Sending...</Text>
              </View>
            ) : (
              <Text>Send Reset Link</Text>
            )}
          </Button>

          <View className="flex-row justify-center gap-2">
            <Text className="text-sm text-muted-foreground">
              Remember your password?{' '}
            </Text>
            <Link href="/auth" asChild>
              <Text className="text-sm font-semibold text-primary hover:underline">
                Sign In
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
```

Create `app/(auth)/reset-password-confirm.tsx`:

```typescript
// app/(auth)/reset-password-confirm.tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import { useTranslations } from '@/i18n';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { AuthService } from '@/services/auth';

export default function ResetPasswordConfirmScreen() {
  const t = useTranslations();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('At least one lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('At least one number');
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('At least one special character');
    return errors;
  };

  const passwordErrors = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleUpdatePassword = async () => {
    if (passwordErrors.length > 0 || !passwordsMatch) {
      Alert.alert('Validation Error', 'Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.updatePassword(password);
      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated. Please sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/auth'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 py-6">
      <View className="mt-8 flex-1 justify-center">
        <View className="mb-8 text-center">
          <Text className="text-3xl font-bold text-primary">New Password</Text>
          <Text className="mt-2 text-muted-foreground">
            Create a new strong password for your account
          </Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">New Password</Text>
            <View className="relative">
              <Textarea
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                className="h-12 pr-10"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  as={showPassword ? 'Eye' : 'EyeOff'}
                  className="size-4 text-muted-foreground"
                />
              </Button>
            </View>

            {password.length > 0 && (
              <View className="mt-2 space-y-1 rounded-md bg-muted/50 p-3">
                {[
                  { label: 'At least 8 characters', valid: password.length >= 8 },
                  { label: 'At least one uppercase letter', valid: /[A-Z]/.test(password) },
                  { label: 'At least one lowercase letter', valid: /[a-z]/.test(password) },
                  { label: 'At least one number', valid: /[0-9]/.test(password) },
                  { label: 'At least one special character', valid: /[^A-Za-z0-9]/.test(password) },
                ].map((req, idx) => (
                  <View key={idx} className="flex-row items-start gap-2">
                    <Icon
                      as={req.valid ? 'CheckCircle' : 'Circle'}
                      className={`mt-0.5 size-4 ${req.valid ? 'text-green-500' : 'text-muted-foreground'}`}
                    />
                    <Text className={`text-xs ${req.valid ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Confirm Password</Text>
            <Textarea
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              className="h-12"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
            />
            {!passwordsMatch && confirmPassword.length > 0 && (
              <Text className="text-xs text-destructive">
                Passwords do not match
              </Text>
            )}
          </View>

          <Button
            className="mt-4"
            disabled={isLoading || passwordErrors.length > 0 || !passwordsMatch}
            onPress={handleUpdatePassword}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <Icon as="Loader2" className="size-4 animate-spin" />
                <Text>Updating...</Text>
              </View>
            ) : (
              <Text>Update Password</Text>
            )}
          </Button>

          <View className="flex-row justify-center gap-2">
            <Text className="text-sm text-muted-foreground">
              Remember your password?{' '}
            </Text>
            <Link href="/auth" asChild>
              <Text className="text-sm font-semibold text-primary hover:underline">
                Sign In
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
```

#### 4. Email Verification Flow

Create `app/(auth)/verify.tsx`:

```typescript
// app/(auth)/verify.tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useTranslations } from '@/i18n';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AuthService } from '@/services/auth';

export default function VerifyEmailScreen() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    checkEmailStatus();
  }, []);

  const checkEmailStatus = async () => {
    try {
      const user = await AuthService.getUser();
      if (user?.emailVerified) {
        setIsVerified(true);
        setEmail(user.email);
      } else if (user) {
        setEmail(user.email);
      }
    } catch (error) {
      console.error('Error checking email status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found');
      return;
    }

    setResendLoading(true);

    try {
      const { error } = await AuthService['supabaseClient' as keyof typeof AuthService]?.['supabaseClient']?.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${process.env.EXPO_PUBLIC_SITE_URL || 'http://localhost:8081'}/auth/verify`,
        },
      });

      if (error) {
        throw error;
      }

      Alert.alert('Verification Email Sent', 'Please check your inbox');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send verification email');
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-muted-foreground">Checking email status...</Text>
      </View>
    );
  }

  if (isVerified) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <View className="w-full max-w-md rounded-2xl bg-card p-8 shadow-sm">
          <View className="mb-6 flex-row justify-center">
            <View className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Icon as="CheckCircle" className="size-8 text-green-600" />
            </View>
          </View>
          <Text className="text-2xl font-bold text-center text-foreground mb-4">
            Email Verified!
          </Text>
          <Text className="text-muted-foreground text-center mb-6">
            Your email has been successfully verified. You can now access all features.
          </Text>
          <Button onPress={() => router.replace('/')}>
            <Text>Go to Home</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-4 py-6">
      <View className="mt-8 flex-1 justify-center">
        <View className="mb-8 text-center">
          <Text className="text-3xl font-bold text-primary">Verify Your Email</Text>
          <Text className="mt-2 text-muted-foreground">
            Please verify your email address to complete your registration
          </Text>
        </View>

        <View className="rounded-2xl bg-card p-6 shadow-sm">
          <View className="mb-6 flex-row justify-center">
            <View className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Icon as="Mail" className="size-8 text-blue-600" />
            </View>
          </View>
          
          <Text className="text-center text-muted-foreground mb-6">
            We've sent a verification link to <Text className="font-semibold">{email || 'your email'}</Text>. 
            Please check your inbox and click the link to verify your email address.
          </Text>

          <Button
            className="w-full"
            variant="outline"
            disabled={resendLoading}
            onPress={handleResendVerification}
          >
            {resendLoading ? (
              <View className="flex-row items-center justify-center gap-2">
                <Icon as="Loader2" className="size-4 animate-spin" />
                <Text>Resending...</Text>
              </View>
            ) : (
              <Text>Resend Verification Email</Text>
            )}
          </Button>

          <View className="mt-4 flex-row justify-center gap-2">
            <Text className="text-sm text-muted-foreground">
              Didn't receive the email?{' '}
            </Text>
            <Text className="text-sm font-semibold text-primary">
              Check your spam folder
            </Text>
          </View>
        </View>

        <View className="mt-8 flex-row justify-center gap-2">
          <Text className="text-sm text-muted-foreground">
            Already verified?{' '}
          </Text>
          <Button variant="link" onPress={() => router.replace('/auth')}>
            <Text className="text-sm font-semibold">Sign In</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
```

#### 5. Logout and Session Cleanup

Update `components/header.tsx` to include logout functionality:

```typescript
// components/header.tsx
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslations } from '@/i18n';
import { config } from '@/lib/config';
import { Link, usePathname, useRouter } from 'expo-router';
import { Moon, Sun, LogOut } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable, View, Alert } from 'react-native';
import { sessionManager } from '@/lib/session';

type ROUTES = [
  '/',
  '/about',
  '/auth',
];

export type Href = ROUTES[number];

type NavLinkProps = {
  href: Href;
  label: string;
  active: boolean;
};

function NavLink({ href, label, active }: NavLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable>
        <Text
          className={cnNav(
            'text-sm font-medium',
            active ? 'text-primary underline underline-offset-8' : 'text-foreground'
          )}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

function cnNav(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const pathname = usePathname();
  const t = useTranslations();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await sessionManager.signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const isAuthPage = pathname === '/auth' || pathname === '/auth/signup' || pathname === '/auth/reset-password';

  return (
    <View className="px-4 pt-4 w-full">
      <View className="bg-background border-border flex-row items-center justify-between rounded-2xl border px-4 py-3 shadow-sm">
        <Link href="/" asChild>
          <Pressable>
            <Text className="text-xl font-semibold">{config.site.title}</Text>
          </Pressable>
        </Link>
        <View className="flex-row items-center gap-4">
          {!isAuthPage && (
            <>
              <NavLink href="/" label={t.nav.translate} active={pathname === '/'} />
              <NavLink href="/about" label={t.nav.about} active={pathname === '/about'} />
            </>
          )}
          {isAuthPage ? (
            <NavLink href="/auth" label={t.nav.signin} active={pathname === '/auth'} />
          ) : (
            <>
              <NavLink href="/auth/signup" label={t.nav.signup} active={pathname === '/auth/signup'} />
              <Pressable
                onPress={handleSignOut}
                accessibilityRole="button"
                accessibilityLabel={t.a11y.signOut}
                className="p-1"
              >
                <Icon as={LogOut} className="size-5" />
              </Pressable>
            </>
          )}
          <Pressable
            onPress={toggleColorScheme}
            accessibilityRole="button"
            accessibilityLabel={t.a11y.toggleTheme}
            className="p-1"
          >
            <Icon as={isDark ? Sun : Moon} className="size-5" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
```

### D. Protected Routes

#### Auth Guard Component

Create `components/auth-guard.tsx`:

```typescript
// components/auth-guard.tsx
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { sessionManager } from '@/lib/session';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = sessionManager.onAuthChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    sessionManager.initialize();

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    router.replace('/auth');
    return null;
  }

  return <>{children}</>;
}

// Usage in app/_layout.tsx
// import { AuthGuard } from '@/components/auth-guard';
// <Stack>
//   <Stack.Screen name="index" options={{ headerShown: false }} />
//   <Stack.Screen name="about" options={{ headerShown: false }} />
//   <Stack.Screen name="auth" options={{ headerShown: false }} />
// </Stack>
```

#### Protected Route Wrapper

Create `lib/with-auth.tsx`:

```typescript
// lib/with-auth.tsx
import { AuthGuard } from '@/components/auth-guard';
import { ReactNode } from 'react';

interface WithAuthProps {
  children: ReactNode;
}

export function withAuth(WrappedComponent: React.FC, options: { guard?: boolean } = {}) {
  return function WithAuth(props: any) {
    if (options.guard === false) {
      return <WrappedComponent {...props} />;
    }

    return (
      <AuthGuard>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
}

// Usage:
// export default withAuth(MyProtectedComponent);
```

### E. User Profile Management

#### Profile Screen

Create `app/profile.tsx`:

```typescript
// app/profile.tsx
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/icon';
import { useTranslations } from '@/i18n';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView, Alert, Image } from 'react-native';
import { AuthService } from '@/services/auth';
import { sessionManager } from '@/lib/session';

export default function ProfileScreen() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<import('@/services/auth').User | null>(null);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await AuthService.getUser();
      setUser(user);
      setFullName(user?.fullName ?? '');
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name is required');
      return;
    }

    setIsSaving(true);

    try {
      await AuthService.updateProfile({ fullName });
      Alert.alert('Success', 'Profile updated successfully');
      loadUser();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background px-4 py-6">
      <View className="mt-8 max-w-2xl mx-auto">
        <Text className="text-2xl font-bold mb-6">Profile</Text>

        <View className="rounded-2xl bg-card p-6 shadow-sm">
          {/* Avatar */}
          <View className="flex-row items-center gap-4 mb-6">
            <View className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Text className="text-3xl">
                {user?.fullName?.[0]?.toUpperCase() ?? '👤'}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted-foreground">Email</Text>
              <Text className="font-medium">{user?.email}</Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                {user?.emailVerified ? '✓ Email verified' : '✉️ Email not verified'}
              </Text>
            </View>
          </View>

          {/* Full Name */}
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Full Name</Text>
            <Textarea
              value={fullName}
              onChangeText={setFullName}
              className="h-12"
              autoCapitalize="words"
            />
          </View>

          {/* Save Button */}
          <Button
            className="mt-6"
            disabled={isSaving || !fullName.trim()}
            onPress={handleSaveProfile}
          >
            {isSaving ? (
              <View className="flex-row items-center gap-2">
                <Icon as="Loader2" className="size-4 animate-spin" />
                <Text>Saving...</Text>
              </View>
            ) : (
              <Text>Save Changes</Text>
            )}
          </Button>
        </View>

        {/* Account Actions */}
        <View className="mt-6 rounded-2xl bg-card p-6 shadow-sm space-y-4">
          <Text className="text-lg font-semibold">Account Actions</Text>
          
          <Button variant="outline" className="w-full" onPress={() => router.push('/auth/reset-password')}>
            <Text>Change Password</Text>
          </Button>

          <Button variant="destructive" className="w-full" onPress={() => {
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AuthService['supabaseClient' as keyof typeof AuthService]?.['supabaseClient']?.auth.admin.deleteUser(user?.id ?? '');
                      await sessionManager.signOut();
                      router.replace('/auth');
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Failed to delete account');
                    }
                  },
                },
              ]
            );
          }}>
            <Text>Delete Account</Text>
          </Button>
        </View>

        <View className="mt-6 text-center">
          <Text className="text-sm text-muted-foreground">
            Created on {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
```

### F. Security Best Practices

#### 1. Secure Storage Configuration

The `lib/supabase.ts` already implements secure storage using `expo-secure-store`. For production, consider:

```typescript
// lib/supabase.ts (production-ready version)
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { env } from './env';

const storage = {
  getItem: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value ?? null;
    } catch (error) {
      console.error('SecureStore error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore error:', error);
    }
  },
};

export const createSupabaseClient = () => {
  // ... initialization code
};
```

#### 2. Token Management

The Supabase client automatically handles token refresh. To add manual token validation:

```typescript
// services/token-validator.ts
import { supabaseClient } from '@/lib/supabase';

export class TokenValidator {
  static async validateToken(): Promise<boolean> {
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      
      if (error || !data.user) {
        return false;
      }

      // Check if token is about to expire (within 5 minutes)
      const session = await supabaseClient.auth.getSession();
      const expiresAt = session.data.session?.expires_at;
      
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const buffer = 5 * 60; // 5 minutes
        
        if (expiresAt - now < buffer) {
          await supabaseClient.auth.refreshSession();
          return true;
        }
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  static async enforceAuthentication(): Promise<void> {
    const isValid = await this.validateToken();
    
    if (!isValid) {
      // Redirect to login or show auth modal
      throw new Error('Session expired');
    }
  }
}
```

#### 3. Rate Limiting

Implement client-side rate limiting:

```typescript
// lib/rate-limiter.ts
export class RateLimiter {
  private static requests: Record<string, number[]> = {};

  static async allowRequest(key: string, maxRequests: number = 5, windowMs: number = 60000): Promise<boolean> {
    const now = Date.now();
    
    if (!this.requests[key]) {
      this.requests[key] = [];
    }

    // Remove old requests outside the window
    this.requests[key] = this.requests[key].filter(timestamp => now - timestamp < windowMs);

    if (this.requests[key].length >= maxRequests) {
      return false;
    }

    this.requests[key].push(now);
    return true;
  }

  static getRemainingRequests(key: string, maxRequests: number = 5, windowMs: number = 60000): number {
    const now = Date.now();
    
    if (!this.requests[key]) {
      return maxRequests;
    }

    const validRequests = this.requests[key].filter(timestamp => now - timestamp < windowMs);
    return Math.max(0, maxRequests - validRequests.length);
  }

  static getRetryAfter(key: string, windowMs: number = 60000): number {
    const now = Date.now();
    
    if (!this.requests[key] || this.requests[key].length === 0) {
      return 0;
    }

    const oldestRequest = this.requests[key][0];
    return Math.max(0, windowMs - (now - oldestRequest));
  }
}

// Usage in auth service
async function signInWithRateLimit(email: string, password: string) {
  const key = `auth:signin:${email}`;
  
  if (!(await RateLimiter.allowRequest(key))) {
    const retryAfter = RateLimiter.getRetryAfter(key);
    throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 1000)} seconds.`);
  }

  // Proceed with sign in...
}
```

#### 4. Input Validation

All inputs are validated using Zod schemas (see `services/auth.ts`).

#### 5. XSS/CSRF Protection

Supabase's SDK handles CSRF protection automatically. For XSS protection:

```typescript
// lib/sanitizer.ts
export class Sanitizer {
  static sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static stripHTML(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}
```

#### 6. Session Hijacking Prevention

Supabase's secure storage and token management prevents session hijacking. Additional measures:

```typescript
// lib/session-security.ts
import { Platform } from 'react-native';
import * as Device from 'expo-device';

export class SessionSecurity {
  static async getDeviceFingerprint(): Promise<string> {
    const deviceId = Device.deviceId ?? 'unknown';
    const deviceName = Device.deviceName ?? 'unknown';
    const osName = Platform.OS;
    
    return btoa(JSON.stringify({ deviceId, deviceName, osName }));
  }

  static async validateDevice(fingerprint: string): Promise<boolean> {
    const currentFingerprint = await this.getDeviceFingerprint();
    return fingerprint === currentFingerprint;
  }
}
```

### G. Production Considerations

#### 1. Environment-Specific Configuration

Create `app.config.ts` for environment-specific settings:

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LinguoMaster',
  slug: 'linguomaster',
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY,
  },
  experiments: {
    tsconfigPaths: true,
  },
  plugins: [
    'expo-router',
    [
      'expo-secure-store',
      {
        faceIDUsageDescription: 'Allow access to your Face ID to secure your account.',
      },
    ],
  ],
  ios: {
    bundleIdentifier: 'com.linguomaster.app',
    supportsTablet: true,
  },
  android: {
    package: 'com.linguomaster.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
});
```

#### 2. Error Monitoring

Add error monitoring with Sentry:

```bash
pnpm add @sentry/react-native
```

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableNative: true,
  enableNativeCrashHandling: true,
  enableNdkOnAndroid: true,
  enableUserInteractionTracing: true,
  debug: __DEV__,
  tracesSampleRate: 1.0,
  _experiments: {
    profilesSampleRate: 1.0,
  },
});

export { Sentry };
```

#### 3. Analytics

Add analytics with PostHog or Segment:

```bash
pnpm add posthog-react-native
```

```typescript
// lib/analytics.ts
import PostHog from 'posthog-react-native';

export const analytics = new PostHog({
  apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
  host: 'https://app.posthog.com',
});

export const trackEvent = (event: string, properties?: Record<string, any>) => {
  analytics.capture(event, properties);
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  analytics.identify(userId, properties);
};
```

#### 4. Testing Strategies

Create `__tests__/auth.test.ts`:

```typescript
// __tests__/auth.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { AuthService } from '@/services/auth';
import { jest } from '@jest/globals';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign up with valid credentials', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    jest.spyOn(supabaseClient.auth, 'signUp').mockResolvedValue({
      data: { user: mockUser, session: null },
      error: null,
    });

    const result = await AuthService.signUpWithEmailAndPassword(
      'test@example.com',
      'Password123!',
      'Test User'
    );

    expect(result.email).toBe('test@example.com');
    expect(result.fullName).toBe('Test User');
  });

  it('should throw error for invalid email', async () => {
    await expect(
      AuthService.signUpWithEmailAndPassword('invalid-email', 'Password123!', 'Test')
    ).rejects.toThrow('Please enter a valid email address');
  });

  it('should throw error for weak password', async () => {
    await expect(
      AuthService.signUpWithEmailAndPassword('test@example.com', 'weak', 'Test')
    ).rejects.toThrow('Password must be at least 8 characters');
  });

  it('should sign in with valid credentials', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    jest.spyOn(supabaseClient.auth, 'signInWithPassword').mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null,
    });

    const result = await AuthService.signInWithEmailAndPassword(
      'test@example.com',
      'Password123!'
    );

    expect(result.email).toBe('test@example.com');
  });

  it('should handle sign out', async () => {
    jest.spyOn(supabaseClient.auth, 'signOut').mockResolvedValue({
      data: {},
      error: null,
    });

    await expect(AuthService.signOut()).resolves.toBeUndefined();
  });
});
```

#### 5. CI/CD Integration

Add authentication tests to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run type checking
        run: pnpm typecheck
      
      - name: Run lint
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_PUBLIC_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY }}
```

---

## 4. Code Examples

### Complete Auth Service Implementation

See `services/auth.ts` for the complete implementation.

### Auth Guard Component

See `components/auth-guard.tsx` for the complete implementation.

### Sign Up Screen with Form Validation

See `app/(auth)/signup.tsx` for the complete implementation.

### Sign In Screen with Form Validation

See `app/(auth)/signin.tsx` for the complete implementation.

### Password Reset Screens

See `app/(auth)/reset-password.tsx` and `app/(auth)/reset-password-confirm.tsx` for the complete implementations.

### Email Verification Screen

See `app/(auth)/verify.tsx` for the complete implementation.

### Protected Route Wrapper

See `lib/with-auth.tsx` for the complete implementation.

---

## 5. Testing

### Unit Tests for Auth Service

See `__tests__/auth.test.ts` for the complete implementation.

### Integration Tests

Create `__tests__/auth-integration.test.tsx`:

```typescript
// __tests__/auth-integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react-native';
import { AuthGuard } from '@/components/auth-guard';
import { sessionManager } from '@/lib/session';
import { Text } from '@/components/ui/text';

describe('AuthGuard Integration', () => {
  it('renders children when user is authenticated', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      fullName: 'Test User',
      avatarUrl: null,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    jest.spyOn(sessionManager, 'onAuthChange').mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    const TestComponent = () => <Text>Protected Content</Text>;
    const WrappedComponent = () => (
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    render(<WrappedComponent />);

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('redirects when user is not authenticated', async () => {
    jest.spyOn(sessionManager, 'onAuthChange').mockImplementation((callback) => {
      callback(null);
      return () => {};
    });

    const TestComponent = () => <Text>Protected Content</Text>;
    const WrappedComponent = () => (
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    render(<WrappedComponent />);

    // Router navigation would be tested with jest-express
  });
});
```

### E2E Testing Strategies

Use Detox for E2E testing:

```bash
pnpm add -D detox detox-cli
```

Create `e2e/auth.spec.js`:

```javascript
// e2e/auth.spec.js
describe('Authentication', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should sign up successfully', async () => {
    await element(by.text('Sign Up')).tap();
    
    await element(by.placeholder('Full Name')).typeText('Test User');
    await element(by.placeholder('john@example.com')).typeText('test@example.com');
    await element(by.placeholder('••••••••')).typeText('Password123!');
    await element(by.placeholder('••••••••')).typeText('Password123!');
    await element(by.text('Create Account')).tap();
    
    await expect(element(by.text('Account Created'))).toBeVisible();
  });

  it('should sign in successfully', async () => {
    await element(by.placeholder('john@example.com')).typeText('test@example.com');
    await element(by.placeholder('••••••••')).typeText('Password123!');
    await element(by.text('Sign In')).tap();
    
    await expect(element(by.text('Home'))).toBeVisible();
  });

  it('should show validation errors for invalid input', async () => {
    await element(by.text('Sign Up')).tap();
    await element(by.text('Create Account')).tap();
    
    await expect(element(by.text('Full name must be at least 2 characters'))).toBeVisible();
  });
});
```

---

## 6. Troubleshooting

### Common Issues and Solutions

#### 1. Session Not Persisting

**Problem**: User session is lost on app restart.

**Solution**: Ensure `persistSession` is enabled in Supabase client configuration:

```typescript
// lib/supabase.ts
const supabase = createClient(url, key, {
  auth: {
    persistSession: true, // Must be true
    autoRefreshToken: true,
  },
});
```

#### 2. Token Refresh Failures

**Problem**: Auth tokens expire and don't refresh automatically.

**Solution**: Implement manual token refresh with error handling:

```typescript
// services/auth.ts
static async refreshSession(): Promise<void> {
  const { error } = await supabaseClient.auth.refreshSession();
  
  if (error) {
    if (error.message.includes('Session not found')) {
      await supabaseClient.auth.signOut();
    }
    throw error;
  }
}
```

#### 3. Email Verification Not Working

**Problem**: Email verification links don't work or expire quickly.

**Solution**: Configure email settings in Supabase dashboard:
- Set email template expiry time
- Configure email redirect URL
- Enable email confirmations

#### 4. Rate Limiting Issues

**Problem**: Getting rate limited during development.

**Solution**: Clear rate limit storage or increase limits for development:

```typescript
// Clear rate limits for development
localStorage.clear();
```

#### 5. Secure Store Not Working on Android

**Problem**: SecureStore throws errors on Android.

**Solution**: Add required permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

### Debugging Tips

1. **Enable Debug Mode**:
   ```typescript
   // lib/env.ts
   export const env = {
     debug: __DEV__ || Platform.OS === 'web',
   };
   ```

2. **Log Supabase Events**:
   ```typescript
   supabaseClient.auth.onAuthStateChange((event, session) => {
     if (env.debug) {
       console.log('Auth state changed:', event, session);
     }
   });
   ```

3. **Check Network Requests**:
   Use React Native Debugger to inspect network requests to Supabase.

4. **Verify Environment Variables**:
   ```typescript
   console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
   console.log('Public Key:', process.env.EXPO_PUBLIC_SUPABASE_PUBLIC_KEY);
   ```

### Logging Strategies

Create a comprehensive logging utility:

```typescript
// lib/logger.ts
import { env } from './env';

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (env.debug) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  error: (message: string, error?: Error | unknown) => {
    console.error(`[ERROR] ${message}`, error);
    
    if (env.debug && error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  },

  auth: (event: string, data: any) => {
    if (env.debug) {
      console.log(`[AUTH] ${event}`, data);
    }
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
};
```

---

## Additional Resources

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Expo Router Docs](https://expo.github.io/router/docs/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [shadcn/ui Native](https://ui.shadcn.com/docs/installation/expo)

---

## Changelog

- **v1.0.0** (Current)
  - Complete authentication guide
  - Email/password authentication
  - Session management
  - Protected routes
  - Security best practices
  - Testing strategies
