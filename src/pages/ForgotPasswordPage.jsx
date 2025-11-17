import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../config/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Obtener la URL base actual para usarla en redirectTo
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/auth/callback`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });

      if (error) {
        throw error;
      }

      setMessage('¡Correo de restablecimiento enviado! Revisa tu bandeja de entrada y haz clic en el enlace para continuar.');
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setError(error.message || 'Hubo un error al enviar el correo de restablecimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D1D27] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src="/src/utils/logo.png"
              alt="Logo RACOM POS"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-bold text-[#F0F0F0]">RACOM POS</h1>
          </div>
          <p className="text-[#a0a0b0]">Restablecer Contraseña</p>
        </div>

        <div className="bg-[#282837] rounded-xl border border-[#3a3a4a] p-8">
          {message ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <div className="mb-6 p-4 bg-green-500 text-white rounded-lg text-center">
                {message}
              </div>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center text-[#a0a0b0] hover:text-[#F0F0F0] font-medium py-2"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Volver al login
              </button>
            </div>
          ) : (
            <>
              <p className="text-[#a0a0b0] mb-6 text-center">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500 text-white rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-[#a0a0b0] mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ingresa tu email"
                      className="w-full bg-[#1D1D27] text-[#F0F0F0] border border-[#3a3a4a] rounded-lg pl-10 pr-4 py-3 focus:border-[#8A2BE2] outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8A2BE2] hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
                </button>
              </form>

              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center text-[#a0a0b0] hover:text-[#F0F0F0] font-medium py-2"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Volver al login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;