import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import useAppStore from '../store/useAppStore';
import logo from '../utils/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { handleLogin, darkMode } = useAppStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await handleLogin(email, password);
    if (result.success) {
      if (result.user.role === 'admin' || result.user.role === 'gerente') {
        navigate('/admin');
      } else if (result.user.role === 'cajera') {
        navigate('/pos/1'); // Assuming storeId 1 for now
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} flex items-center justify-center p-4 sm:p-6 lg:p-8`}>
      <Card className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-grow">
            <img src={logo} alt="RACOM POS Logo" className="w-48 mx-auto" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email"
              icon={User}
              className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              icon={Lock}
              className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              required
            />
          </div>

          {error && ( // Display error message
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Iniciar Sesión
          </Button>
        </form>

        {/* Removed hardcoded credentials */}
      </Card>
    </div>
  );
};

export default LoginPage;