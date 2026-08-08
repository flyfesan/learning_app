import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { LANGUAGES } from '@/constants/languages';
import { useTranslations } from '@/i18n';
import { translateText } from '@/services/translate';
import { useState } from 'react';
import { View } from 'react-native';

type TranslationState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; translation: string }
  | { kind: 'error'; error: string };

export default function TranslateScreen() {
  const t = useTranslations();
  const [source, setSource] = useState<Option>(undefined);
  const [target, setTarget] = useState<Option>(undefined);
  const [text, setText] = useState('');
  const [state, setState] = useState<TranslationState>({ kind: 'idle' });

  const handleTranslate = async () => {
    if (!source || !target || !text.trim() || state.kind === 'loading') return;

    setState({ kind: 'loading' });
    try {
      const { result } = await translateText({
        text: text.trim(),
        source: source.value,
        target: target.value,
      });
      setState({ kind: 'success', translation: result });
    } catch (error) {
      setState({
        kind: 'error',
        error: error instanceof Error ? error.message : 'Translation failed',
      });
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 gap-4 px-4 py-6">
        <View className="gap-1">
          <Text variant="h3">{t.pages.translateTitle}</Text>
          <Text variant="muted">{t.pages.translateDesc}</Text>
        </View>

        {state.kind === 'error' && (
          <View className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
            <Text className="text-sm text-destructive">{state.error}</Text>
          </View>
        )}

        <View className="flex-row justify-center gap-4">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} label={lang.name}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Target Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} label={lang.name}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </View>

        <Textarea
          value={text}
          onChangeText={setText}
          placeholder="Enter text to translate"
          className="min-h-56 p-4"
        />

        <Button
          className="self-end rounded-full px-6"
          onPress={handleTranslate}
          disabled={state.kind === 'loading'}>
          <Text>{state.kind === 'loading' ? 'Translating...' : t.action.translate}</Text>
        </Button>

        {state.kind === 'success' && (
          <View className="border-border rounded-lg border p-4">
            <Text className="mb-2 text-sm font-semibold">Translation</Text>
            <Text>{state.translation}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
