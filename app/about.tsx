import { Text } from '@/components/ui/text';
import { useTranslations } from '@/i18n';
import { View } from 'react-native';

export default function AboutScreen() {
  const t = useTranslations();

  return (
    <View className="flex-1 w-full">
      <View className="flex-1 gap-4 px-4 py-6 max-w-3xl">
        <View className="gap-1">
          <Text variant="h3">{t.nav.about}</Text>
          <Text variant="muted">A bit about this app.</Text>
        </View>
        <Text variant="p">{"Just a description of the project I'm building here"}</Text>
      </View>
    </View>
  );
}
