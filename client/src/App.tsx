import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeForm from './pages/RecipeForm';
import MyRecipes from './pages/MyRecipes';
import SavedRecipes from './pages/SavedRecipes';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipes/new" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
        <Route path="/recipes/:id/edit" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
        <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedRecipes /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
        <Route path="/recipes/new" element={<RecipeForm />} />
        <Route path="/recipes/edit/:id" element={<RecipeForm />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
      </Routes>
    </>
  );
}
