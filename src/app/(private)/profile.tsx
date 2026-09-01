import { useSession } from '@/services/auth/context';

export const Profile = () => {

    const { session } = useSession();
    return (

        <p>User is logged in: {session}</p>
    );
};

export default Profile;