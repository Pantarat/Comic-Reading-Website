import './App.css';
import SignIn from './pages/SignIn.jsx';
import Register from './pages/Register.jsx';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import AdminPage from './pages/Adminpage.jsx';
import BookmarkPage from './pages/Bookmark.jsx';
import Bookpage from './pages/Bookpage.jsx';
import EditBook from './pages/EditBook.jsx';
import Search from './pages/Search.jsx';
import EditUser from './pages/EditUser.jsx';
import Hamburgermenu from './components/Hamburgermenu.jsx';
import { AuthProvider } from './components/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute';
import PrivateAdmin from './components/PrivateAdmin';
import AddBook from './pages/AddBook';
import ComicBookPage from './pages/ComicBookPage';
import History from './pages/History';

function App() {
    const location = useLocation();

    // List of routes where Hamburgermenu should not appear
    const excludedRoutes = ['/register', '/signin'];

    // Check if the current route is in the excludedRoutes list
    const isHamburgermenuVisible = !excludedRoutes.includes(location.pathname);

    return (
        <AuthProvider>
            {isHamburgermenuVisible && <Hamburgermenu />}
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/" element={<Navigate to="/signin" />} />
                <Route path="/edituser" element={<PrivateRoute component={EditUser} />} />
                <Route path="/search" element={<PrivateRoute component={Search} />} />
                <Route path="/history" element={<PrivateRoute component={History} />} />
                <Route path="/bookpage" element={<PrivateRoute component={Bookpage} />} />
                <Route path="/bookmark" element={<PrivateRoute component={BookmarkPage} />} />
                <Route path="/chapter" element={<PrivateRoute component={ComicBookPage} />} />
                <Route path="/admin" element={<PrivateAdmin component={AdminPage} />} />
                <Route path="/editbook" element={<PrivateAdmin component={EditBook} />} />
                <Route path="/addbook" element={<PrivateAdmin component={AddBook} />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
