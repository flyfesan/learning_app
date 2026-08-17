import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/i18n';
import { translateText } from '@/services/translate';
import { useState } from 'react';
import { View } from 'react-native';

type TranslationState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; translation: string }
  | { kind: 'error'; error: string };

const LANGUAGES = [
  // { code: 'ja', name: 'Japanese' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  // { code: 'fr', name: 'French' },
  // { code: 'de', name: 'German' },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];
type LanguageName = (typeof LANGUAGES)[number]['name'];

type LanguageOption = Readonly<{
  code: LanguageCode;
  name: LanguageName;
}>;

export default function TranslateScreen() {
  const t = useTranslations();
  const [source, setSource] = useState<LanguageOption | undefined>(undefined);
  const [target, setTarget] = useState<LanguageOption | undefined>(undefined);
  const [text, setText] = useState('');
  const [state, setState] = useState<TranslationState>({ kind: 'idle' });

  const handleTranslate = async () => {
    if (!source || !target || !text.trim() || state.kind === 'loading') return;

    setState({ kind: 'loading' });
    const result = await translateText({
      text: text.trim(),
      source: source.code,
      target: target.code,
    });

    setState(
      result.kind === 'success'
        ? { kind: 'success', translation: result.result }
        : { kind: 'error', error: result.error }
    );

  };

  return (
    <View className="flex-1">
      <View className="flex-1 gap-4 px-4 py-6">
        <View className="gap-1">
          <Label className="text-xl">{t.pages.translateTitle}</Label>
        </View>

        {state.kind === 'error' && (
          <View className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
            <Label className="text-sm text-destructive">{state.error}</Label>
          </View>
        )}

        <View className="flex-row justify-center gap-4">
          <Select value={source?.code} onValueChange={(code) => setSource(LANGUAGES.find(lang => lang.code === code))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder='Source Language' />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} >
                  <Label>{lang.name}</Label>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={target?.code} onValueChange={(code) => setTarget(LANGUAGES.find(lang => lang.code === code))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Target Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem className="foreground" key={lang.code} value={lang.code}>
                  <Label>{lang.name}</Label>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </View>

        <Textarea
          value={text}
          onChangeText={setText}
          placeholder={t.pages.translateDesc}
          className="min-h-56 p-4"
        />

        <Button
          className="self-end px-6"
          onClick={handleTranslate}
          variant="outline"
          disabled={state.kind === 'loading'}>
          <Label>{state.kind === 'loading' ? 'Translating...' : t.action.translate}</Label>
        </Button>

        {state.kind === 'success' && (
          <View className="border-border rounded-lg border p-4">
            <Label className="mb-2 text-sm font-semibold">Translation</Label>
            <Label>{state.translation}</Label>
          </View>
        )}
      </View>
    </View>
  );
}
