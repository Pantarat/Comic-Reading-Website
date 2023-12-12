
import { useAuth } from './AuthContext';
import AdminAccess from './AdminAccess';
import LoginPrompt from './LoginPrompt';


const PrivateAdmin = ({ component: Component, ...rest }) => {
    const { user } = useAuth();

    if (!user) {
        return (
            <LoginPrompt />
        )
    }

    return user.isAdmin ? (
        <Component {...rest} />
    ) : (
        <AdminAccess />
    );
};

export default PrivateAdmin;
