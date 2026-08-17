import { RegisterForm } from "@/components/register-form"
import { View } from "react-native"

export default function RegisterPage() {
    return (
        <View className="flex flex-col items-center gap-6 p-6 md:p-10">
            <RegisterForm />
        </View>
    )
}
