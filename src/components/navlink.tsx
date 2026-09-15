import { Link } from "expo-router";
import { Label } from "@/components/ui/label";
import { Pressable } from "react-native";

function cnNav(...classes: (string | false | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

type ROUTES = [
    '/',
    '/translate',
    '/(public)/(auth)/login',
    '/(public)/(auth)/register',
    '/(private)/profile',
    '/(private)/logout',
    '/(private)/translate'
];

export type Href = ROUTES[number];

type NavLinkKind = {
    kind: 'link';
    href: Href;
} | {
    kind: 'button';
    onClick: () => void;
}

type NavLinkProps = {
    navKind: NavLinkKind;
    label: string;
    active?: boolean;
};

export const NavLink = ({ navKind, label, active }: NavLinkProps) => {
    if (navKind.kind === 'button') {
        return (
            <Pressable onPress={navKind.onClick}>
                <Label
                    className={cnNav(
                        'text-sm font-medium',
                        active ? 'text-primary underline underline-offset-8' : 'text-foreground'
                    )}>
                    {label}
                </Label>
            </Pressable>
        );
    }
    return (
        <Link href={navKind.href} asChild>
            <Pressable>
                <Label
                    className={cnNav(
                        'text-sm font-medium',
                        active ? 'text-primary underline underline-offset-8' : 'text-foreground'
                    )}>
                    {label}
                </Label>
            </Pressable>
        </Link>
    );
}