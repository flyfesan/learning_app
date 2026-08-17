import React, { useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { createSupabaseClient } from '@/lib/supabase'

export const Auth = () => {
    const supabase = createSupabaseClient();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    return (
        <View className="flex-1 items-center p-4">
            <View className="w-full max-w-md">
                <Text className="mb-2 text-sm font-medium">Email</Text>
                <TextInput
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize="none"
                    className="mb-4 w-full rounded border px-3 py-2"
                />
            </View>
            <View className="w-full max-w-md">
                <Text className="mb-2 text-sm font-medium">Password</Text>
                <TextInput
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize="none"
                    className="mb-4 w-full rounded border px-3 py-2"
                />
            </View>
            <View className="w-full max-w-md">
                <TouchableOpacity
                    className={`mb-4 w-full rounded  px-3 py-2 ${loading ? 'opacity-50' : ''}`}
                    onPress={() => signInWithEmail()}
                    disabled={loading}
                >
                    <Text className="text-center ">Sign in</Text>
                </TouchableOpacity>
            </View>
            <View className="w-full max-w-md">
                <TouchableOpacity
                    className={`mb-4 w-full rounded  px-3 py-2 ${loading ? 'opacity-50' : ''}`}
                    onPress={() => signUpWithEmail()}
                    disabled={loading}
                >
                    <Text className="text-center">Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}