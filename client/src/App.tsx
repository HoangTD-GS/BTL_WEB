import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import EasterEgg from './components/EasterEgg';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import PrankModal from './components/ui/PrankModal';
import ToastContainer from './components/ui/ToastContainer';
import { useAuth } from './context/useAuth';
import { useSavedSync } from './hooks/useSavedSync';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import MyRecipes from './pages/MyRecipes';
import NotFound from './pages/NotFound';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import Register from './pages/Register';
import SavedRecipes from './pages/SavedRecipes';
import ProtectedRoute from './routes/ProtectedRoute';

function getPageTheme(pathname: string): string {
  if (pathname === '/') return 'page-home';
  if (pathname.startsWith('/recipes/new') || pathname.startsWith('/recipes/edit')) return 'page-form';
  if (pathname.startsWith('/recipes/')) return 'page-detail';
  if (pathname.startsWith('/my-recipes')) return 'page-my-recipes';
  if (pathname.startsWith('/saved')) return 'page-saved';
  if (pathname.startsWith('/admin')) return 'page-admin';
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return 'page-auth';
  return 'page-default';
}

export default function App() {
  useSavedSync();
  const { user, loading } = useAuth();
  const location = useLocation();
  const pageTheme = getPageTheme(location.pathname);
  const [prankOpen, setPrankOpen] = useState(false);
  const [eggClaimCount, setEggClaimCount] = useState(() => {
    const stored = Number(localStorage.getItem('cookbook:easterEggClaims'));
    if (Number.isFinite(stored) && stored > 0) return Math.floor(stored);
    if (localStorage.getItem('cookbook:easterEggClaimed') === 'true') {
      localStorage.setItem('cookbook:easterEggClaims', '1');
      localStorage.removeItem('cookbook:easterEggClaimed');
      return 1;
    }
    return 0;
  });
  const [eggHidden, setEggHidden] = useState(
    () => localStorage.getItem('cookbook:easterEggHidden') === 'true'
  );
  const isRegularUser = user?.role === 'user';
  const canShowEgg = !loading && user?.role !== 'admin' && !eggHidden;

  const handleEggClaim = () => {
    setEggClaimCount((count) => {
      const next = count + 1;
      localStorage.setItem('cookbook:easterEggClaims', String(next));
      return next;
    });
    setPrankOpen(true);
  };

  const hideEgg = () => {
    localStorage.setItem('cookbook:easterEggHidden', 'true');
    setEggHidden(true);
  };

  const restoreEgg = () => {
    localStorage.removeItem('cookbook:easterEggHidden');
    setEggHidden(false);
  };

  return (
    <>
      <ScrollToTop />
      <Navbar
        onOpenPrank={() => setPrankOpen(true)}
        easterEggHidden={eggHidden}
        onRestoreEasterEgg={restoreEgg}
      />
      <main key={location.pathname} className={`container page-content ${pageTheme}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/recipes/new"
            element={
              <ProtectedRoute>
                <RecipeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/edit/:id"
            element={
              <ProtectedRoute>
                <RecipeForm />
              </ProtectedRoute>
            }
          />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route
            path="/my-recipes"
            element={
              <ProtectedRoute>
                <MyRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <EasterEgg
        enabled={canShowEgg}
        claimCount={eggClaimCount}
        canHide={isRegularUser}
        onClaim={handleEggClaim}
        onHide={hideEgg}
      />
      <PrankModal open={prankOpen} onClose={() => setPrankOpen(false)} />
      <ToastContainer />
    </>
  );
}
