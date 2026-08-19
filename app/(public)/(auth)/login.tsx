
import { LoginForm } from "@/components/auth/login-form"
import { View } from "react-native"

export default function LoginPage() {
    return (
        <View className="flex flex-col items-center gap-6 p-6 md:p-10">
            <LoginForm ssoFeature={false} />
        </View>
    )
}
