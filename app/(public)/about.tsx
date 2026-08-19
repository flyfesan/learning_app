import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n';
import { View } from 'react-native';

export default function AboutScreen() {
  const t = useTranslations();

  return (
    <View className="w-full">
      <View className="gap-4 px-4 py-6 max-w-3xl">
        <View className="gap-1">
          <Label className="text-lg">{t.nav.about}</Label>
          <Label className="text-muted">A bit about this app.</Label>
        </View>
        <Label>{"Just a description of the project I'm building here"}</Label>
      </View>
    </View>
  );
}
