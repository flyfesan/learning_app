import AuthProvider from '@/services/auth/context';

export const Profile = () => {

    const { user } = AuthProvider.useAuth()
    return (

        <p>User is logged in: {user?.email}</p>
    );
};

export default Profile;