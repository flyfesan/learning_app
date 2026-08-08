import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslations } from '@/i18n';
import { config } from '@/lib/config';
import { Link, usePathname } from 'expo-router';
import { Moon, Sun } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable, View } from 'react-native';

function NavLink({ href, label, active }: { href: '/' | '/about'; label: string; active: boolean }) {
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
  const isDark = colorScheme === 'dark';

  return (
    <View className="px-4 pt-4 w-full">
      <View className="bg-background border-border flex-row items-center justify-between rounded-2xl border px-4 py-3 shadow-sm">
        <Link href="/" asChild>
          <Pressable>
            <Text className="text-xl font-semibold">{config.site.title}</Text>
          </Pressable>
        </Link>
        <View className="flex-row items-center gap-4">
          <NavLink href="/" label={t.nav.translate} active={pathname === '/'} />
          <NavLink href="/about" label={t.nav.about} active={pathname === '/about'} />
          <Pressable
            onPress={toggleColorScheme}
            accessibilityRole="button"
            accessibilityLabel={t.a11y.toggleTheme}
            className="p-1">
            <Icon as={isDark ? Sun : Moon} className="size-5" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
