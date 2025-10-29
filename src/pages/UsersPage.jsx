import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import UserFormModal from '../features/users/UserFormModal';

const UsersPage = () => {
  const { users, deleteUser, stores } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.name || storeId;

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (uid) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUser(uid);
    }
  };

  return (
    <div className="p-6 bg-[#0f0f0f] h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f5]">Gestión de Usuarios</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          Añadir Nuevo Usuario
        </Button>
      </div>

      <Card>
        {users.length === 0 ? (
          <p className="text-[#a0a0a0]">No hay usuarios registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#333333]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">Tienda</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]">
                {users.map((user, index) => (
                  <tr key={user.uid} className={`${index % 2 === 0 ? 'bg-[#202020]' : 'bg-[#2c2c2c]'} hover:bg-[#404040] transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#f5f5f5]">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c0c0c0]">{getStoreName(user.storeId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button onClick={() => handleOpenModal(user)} variant="outline" className="mr-2">
                        Editar
                      </Button>
                      <Button onClick={() => handleDelete(user.uid)} variant="danger">
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Editar Usuario" : "Añadir Nuevo Usuario"}>
        <UserFormModal user={editingUser} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default UsersPage;
