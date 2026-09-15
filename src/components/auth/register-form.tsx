
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/i18n"
import { Link } from "expo-router/build/link/Link"
import { View } from "react-native"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { AuthService } from "@/services/auth"
// import { router } from "expo-router"
import { useSession } from "@/services/auth/context"
import type { Session } from "@supabase/supabase-js"

const Password = z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[A-Z])(?=.*\d)/, { message: "Password must contain at least one uppercase letter and one number" }).brand("Password");
const Email = z.email({ message: "Invalid email address" }).brand("Email");
const FullName = z.string().min(1, { message: "Full name is required" }).brand("FullName");

type Password = z.infer<typeof Password>;
type Email = z.infer<typeof Email>;
type FullName = z.infer<typeof FullName>;

const RegisterFormSchema = z.object({
    fullName: FullName,
    email: Email,
    password: Password,
    confirmPassword: Password,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
});

type RegisterFormInfo = z.infer<typeof RegisterFormSchema>;

type SignUpProps = {
    logIn: (session: Session) => void;
    registerForm: RegisterFormInfo;
}
const signUp = async ({ registerForm, logIn }: SignUpProps) => {
    try {
        const auth = new AuthService();
        const res = await auth.signUp(registerForm);

        if (res.kind === "success") {
            console.log("User signed up:", res.user);
            console.log("Session:", res.session);

            if (typeof res.user === 'undefined' || typeof res.session === 'undefined') {
                throw new Error(`error retrieving the newly signed up user. User=${res.user}; Session=${res.session}`);
            }

            logIn(res.session);
        }

        // router.navigate('(private)/profile');
    } catch (error) {
        if (error instanceof Error) {
            console.error("SignUp: error occurred", error.message);
        } else {
            console.error("SignUp: unknown error occurred", error);
        }
    }
}

type SignUpFormState = { kind: "error"; message: string } | { kind: "idle" };

export const RegisterForm = () => {
    const t = useTranslations();
    const [state, setState] = useState<SignUpFormState>({ kind: "idle" });
    const { logUserIn } = useSession();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInfo>()
    const onSubmit = (data: RegisterFormInfo) => {
        const parsedForm = RegisterFormSchema.safeParse(data);
        if (!parsedForm.success) {
            setState({ kind: "error", message: z.prettifyError(parsedForm.error) });
            return;
        }
        setState({ kind: "idle" });
        signUp({ logIn: logUserIn, registerForm: parsedForm.data });
    }


    return (
        <View className="gap-6 max-w-lg">
            <Card >
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t.auth.signupTitlePage}</CardTitle>
                    <CardDescription>
                        {t.auth.signupDescPage}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field: { onChange, onBlur, } }) => (
                                    <Field onBlur={onBlur} onChange={onChange}>
                                        <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                                        <Input id="fullName" type="text" placeholder="John Doe" required />
                                    </Field>
                                )}
                                name="fullName"
                            />
                            {errors.fullName && (
                                <FieldDescription className="text-destructive">
                                    {errors.fullName.message}
                                </FieldDescription>
                            )}

                            <Controller
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field: { onChange, onBlur, } }) => (
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                            onBlur={onBlur}
                                            onChange={onChange}
                                        />
                                    </Field>
                                )}
                                name="email"
                            />
                            {errors.email && (
                                <FieldDescription className="text-destructive">
                                    {errors.email.message}
                                </FieldDescription>
                            )}

                            <Field>
                                <Field className="grid grid-cols-2 gap-4">
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: true,
                                        }}
                                        render={({ field: { onChange, onBlur, } }) => (
                                            <Field>
                                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                                <Input id="password" type="password" required onBlur={onBlur} onChange={onChange} />
                                            </Field>

                                        )}
                                        name="password"
                                    />
                                    {errors.password && (
                                        <FieldDescription className="text-destructive">
                                            {errors.password.message}
                                        </FieldDescription>
                                    )}
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: true,
                                        }}
                                        render={({ field: { onChange, onBlur, } }) => (
                                            <Field>
                                                <FieldLabel htmlFor="confirm-password">
                                                    Confirm Password
                                                </FieldLabel>
                                                <Input id="confirm-password" type="password" required onBlur={onBlur} onChange={onChange} />
                                            </Field>
                                        )}
                                        name="confirmPassword"
                                    />
                                    {errors.confirmPassword && (
                                        <FieldDescription className="text-destructive">
                                            {errors.confirmPassword.message}
                                        </FieldDescription>
                                    )}
                                </Field>
                                <FieldDescription>
                                    {t.auth.passwordHint}
                                </FieldDescription>
                            </Field>

                            {state?.kind === "error" && (
                                <FieldDescription className="text-destructive">
                                    {state.message}
                                </FieldDescription>
                            )}

                            <Field>
                                <Button type="submit">{t.auth.action.register}</Button>
                                <FieldDescription className="text-center">
                                    {t.auth.haveAccount} <Link href="/(public)/(auth)/login" className="underline hover:text-primary">{t.nav.signin}</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </View>
    )
}
