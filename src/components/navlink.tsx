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
    '/(private)/translate'
];

export type Href = ROUTES[number];

type NavLinkProps = {
    href: Href;
    label: string;
    active: boolean;
};

export const NavLink = ({ href, label, active }: NavLinkProps) => {
    return (
        <Link href={href} asChild>
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