import { useTranslations } from '@/i18n';
import { config } from '@/lib/config';
import { Link, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Label } from '@/components/ui/label';
import { NavLink } from '@/components/navlink';

type HeaderProps = {
  userLoggedIn: boolean;
}

export function Header({ userLoggedIn }: HeaderProps) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <View className="px-4 pt-4 w-full">
      <View className="bg-background border-border flex-row items-center justify-between rounded-2xl border px-4 py-3 shadow-sm">
        <Link href="/" asChild>
          <Pressable>
            <Label className="text-xl font-semibold">{config.site.title}</Label>
          </Pressable>
        </Link>
        <View className="flex-row items-center gap-4">
          {userLoggedIn ?
            <>
              <NavLink href="/" label={t.nav.home} active={pathname === '/'} />
              <NavLink href="/(public)/(auth)/login" label={t.nav.signin} active={pathname === '/login'} />
            </>
            :
            <>
              <NavLink href="/(private)/translate" label={t.nav.translate} active={pathname === '/translate'} />
              <NavLink href="/(private)/profile" label={t.nav.signin} active={pathname === '/login'} />
            </>
          }
        </View>
      </View>
    </View>
  );
}
