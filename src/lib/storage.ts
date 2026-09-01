import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useReducer } from "react";
import { z } from "zod";

export type StorageState<T> = [boolean, T | null];
export type StorageAction<T> = (value: T) => void;
export type StorageStateHook<T> = [StorageState<T>, StorageAction<T>];

export const StorageKeySchema = z.string().brand("StorageKey");
export type StorageKey = z.infer<typeof StorageKeySchema>;
export const StorageValueSchema = z.string().brand("StorageValue");
export type StorageValue = z.infer<typeof StorageValueSchema>;

function useAsyncState<T>(initialValue: StorageState<T> = [true, null]) {
    return useReducer(
        (_state: StorageState<T>, action: T | null = null): StorageState<T> => [false, action],
        initialValue,
    );
}

type StorageErrorKind = "access" | "unknown";
class StorageError extends Error {
    kind: StorageErrorKind;

    constructor(message: string, kind: StorageErrorKind) {
        super(message);

        this.kind = kind;
        Object.setPrototypeOf(this, StorageError.prototype);
    }
}

const setStorageState = async <Key extends StorageKey, Value extends StorageValue | null>(key: Key, value: Value) => {
    if (Platform.OS === "web") {
        try {
            if (value === null) {
                localStorage.removeItem(key);
                return;
            }
            localStorage.setItem(key, value);
        } catch (e) {
            throw new StorageError(`Couldn't access to local storage ${e}`, "access");
        }
    } else {
        if (value === null) {
            await SecureStore.deleteItemAsync(key);
            return;
        }
        await SecureStore.setItemAsync(key, value);
    }
}

export const useStorageState = <Key extends StorageKey, Value extends StorageValue | null>(key: Key): StorageStateHook<Value> => {
    const [state, setState] = useAsyncState<Value>();

    useEffect(() => {
        if (Platform.OS === "web") {
            try {
                if (typeof localStorage !== `undefined`) {
                    setState(localStorage.getItem(key));
                }
            } catch (e) {
                throw new StorageError(
                    `Couldn't access the local storage ${e}`,

                    "access",
                );
            }
        } else {
            SecureStore.getItemAsync(key).then((value: string | null) =>
                setState(value),
            );
        }
    }, [key, setState]);

    const setValue = useCallback(
        (value: Value | null) => {
            setState(value);
            setStorageState(key, value);
        },
        [key, setState],
    );

    return [state, setValue];
}