import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n';
import { View } from 'react-native';

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <View className="px-4 pb-4 w-full">
      <View className="bg-background border-border mt-auto flex-col items-center justify-center rounded-2xl border px-4 py-4">
        <Label className="text-sm text-muted-foreground">
          {t.footer.copyright} &copy; {currentYear} | {t.footer.allRightsReserved}
        </Label>
      </View>
    </View>
  );
}
