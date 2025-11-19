import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../config/supabase';

const PasswordResetHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [isVerification, setIsVerification] = useState(false);

  // Verificar si es un enlace de restablecimiento o verificación
  useEffect(() => {
    // Obtener los parámetros de búsqueda y hash
    const type = searchParams.get('type');
    const token = searchParams.get('token');

    // Obtener también parámetros del hash (después de #)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashType = hashParams.get('type');
    const hashError = hashParams.get('error');
    const hashErrorDescription = hashParams.get('error_description');

    // Verificar también si hay un parámetro de error en searchParams o hash
    const error = searchParams.get('error') || hashError;
    const errorDescription = searchParams.get('error_description') || hashErrorDescription;

    if (error) {
      setMessage(`Error: ${errorDescription || 'El enlace no es válido o ha expirado.'}`);
      return;
    }

    // Priorizar parámetros del hash si están presentes
    const finalType = hashType || type;
    const finalToken = searchParams.get('token'); // El token normalmente viene en search params, no en hash

    if (finalType === 'recovery' && finalToken) {
      setIsRecovery(true);
    } else if ((finalType === 'email' || finalType === 'signup') && finalToken) {
      setIsVerification(true);
    }
    // Si no hay tipo o token, o son inválidos, se mostrará el estado de acción no válida
  }, [searchParams]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      setMessage('Contraseña actualizada con éxito. Redirigiendo...');
      
      // Esperar un momento y redirigir
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    // Lógica para reenviar el correo de verificación
    const email = searchParams.get('email');
    if (email) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) {
          setMessage(`Error al reenviar verificación: ${error.message}`);
        } else {
          setMessage('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
        }
      } catch (error) {
        setMessage(`Error al reenviar verificación: ${error.message}`);
      }
    }
  };

  if (isRecovery) {
    // Formulario para restablecer contraseña
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1D1D27] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#F0F0F0]">
              Restablecer Contraseña
            </h2>
            <p className="mt-2 text-center text-sm text-[#a0a0b0]">
              Ingresa tu nueva contraseña
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${message.includes('éxito') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="newPassword" className="sr-only">
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#3a3a4a] placeholder-[#a0a0b0] text-[#F0F0F0] bg-[#2c2c2c] rounded-t-md focus:outline-none focus:ring-[#8A2BE2] focus:border-[#8A2BE2] focus:z-10 sm:text-sm"
                  placeholder="Nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[#3a3a4a] placeholder-[#a0a0b0] text-[#F0F0F0] bg-[#2c2c2c] rounded-b-md focus:outline-none focus:ring-[#8A2BE2] focus:border-[#8A2BE2] focus:z-10 sm:text-sm"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8A2BE2] hover:bg-[#7b1fa2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8A2BE2] disabled:opacity-50"
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#8A2BE2] hover:text-[#7b1fa2] text-sm"
              >
                Volver al login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isVerification) {
    // Mensaje para verificación de email
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1D1D27] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-[#F0F0F0]">
              Verificación de Email
            </h2>
          </div>

          <div className="mt-8 space-y-6">
            <div className="bg-[#2c2c2c] p-4 rounded-md">
              <p className="text-[#a0a0b0]">
                Tu email ha sido verificado exitosamente. Ahora puedes iniciar sesión.
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8A2BE2] hover:bg-[#7b1fa2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8A2BE2]"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no es un enlace de recuperación o verificación
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1D1D27] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#F0F0F0]">
            {message ? 'Error en la recuperación' : 'Acción no válida'}
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-[#2c2c2c] p-4 rounded-md">
            <p className="text-[#a0a0b0]">
              {message || 'Este enlace no es válido o ya ha sido utilizado. Intenta iniciar sesión normalmente.'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8A2BE2] hover:bg-[#7b1fa2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8A2BE2]"
            >
              Ir al Login
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full flex justify-center py-2 px-4 border border-[#3a3a4a] rounded-md shadow-sm text-sm font-medium text-[#F0F0F0] bg-[#2c2c2c] hover:bg-[#3a3a4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8A2BE2]"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetHandler;