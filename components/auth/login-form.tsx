import { Link } from "expo-router"
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
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/i18n"
import { AppleIcon, GoogleIcon } from "@/components/icons"
import { Text, View } from "react-native"

type SsoButtonProps = {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
};
const SsoButton = ({ label, icon, onClick }: SsoButtonProps) => (
    <Button variant="outline" type="button" onClick={onClick}>
        {icon}
        <Text>{label}</Text>
    </Button>
)

type LoginFormProps = {
    ssoFeature: boolean;
};

export const LoginForm = ({
    ssoFeature,

}: LoginFormProps) => {
    const t = useTranslations();
    return (
        <View className="max-w-lg gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">{t.auth.signinTitlePage}</CardTitle>
                    <CardDescription>
                        {t.auth.signinDescPage}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            {ssoFeature && (
                                <>
                                    <Field>
                                        <SsoButton
                                            label={t.auth.action.googleSignin}
                                            icon={<GoogleIcon />}
                                        />
                                        <SsoButton
                                            label={t.auth.action.appleSignin}
                                            icon={<AppleIcon />}
                                        />
                                    </Field>

                                    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                        {t.auth.continueWith}
                                    </FieldSeparator>
                                </>
                            )}
                            <Field>
                                <FieldLabel htmlFor="email">{t.auth.labels.email}</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>
                            <Field>
                                <View className="flex flex-row items-start justify-between ">
                                    <FieldLabel htmlFor="password">{t.auth.labels.password}</FieldLabel>
                                    <Link
                                        className="ml-auto text-sm underline-offset-4 hover:underline"
                                        href="/(public)/(auth)/reset-password"
                                    >
                                        {t.auth.forgotPassword}
                                    </Link>
                                </View>
                                <Input id="password" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit">Login</Button>
                                <FieldDescription className="text-center">
                                    {t.auth.noAccount}
                                    {' '}
                                    <Link href="/(public)/(auth)/register">
                                        {t.nav.signup}
                                    </Link>
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
        </View >
    )
}
