import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lazy } from '@/lib/utils';
import { getEnv } from '@/lib/env';

type Storage = {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}

export const createSupabaseClient = lazy(() => {
    const env = getEnv();

    const getStorage = (): Storage => {
        if (Platform.OS === 'web') {
            return {
                getItem: AsyncStorage.getItem,
                setItem: AsyncStorage.setItem,
                removeItem: AsyncStorage.removeItem,
            } // Use AsyncStorage for web
        }

        // Platform.OS == 'ios' || 'android'
        return {
            getItem: SecureStore.getItemAsync,
            setItem: SecureStore.setItemAsync,
            removeItem: SecureStore.deleteItemAsync,
        }
    }

    const supabase = createClient(env.supabase, env.supabase_pub, {
        auth: {
            storage: getStorage(),
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });

    return supabase;
});

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
export type SupabaseAuthClient = SupabaseClient['auth'];
