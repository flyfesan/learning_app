import { SplashScreen } from 'expo-router';
import { useSession } from '@/services/auth/context';

SplashScreen.preventAutoHideAsync();

const SplashScreenController = () => {
    const { isLoading } = useSession();

    if (!isLoading) {
        SplashScreen.hide();
    }

    return null;
}

export default SplashScreenController;