'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { UserPlus, Trash2, Mail, Bell, Check, X } from 'lucide-react';

export default function AccountabilityPartnerPanel() {
  const { addAccountabilityPartner, removeAccountabilityPartner, accountabilityPartners } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notifyOnMiss: true,
    notifyOnComplete: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    addAccountabilityPartner(formData);
    setFormData({ name: '', email: '', notifyOnMiss: true, notifyOnComplete: true });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Accountability Partners</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
        >
          <UserPlus size={14} />
          Agregar
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-800/50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              placeholder="juan@email.com"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formData.notifyOnMiss}
                onChange={(e) => setFormData({ ...formData, notifyOnMiss: e.target.checked })}
                className="rounded"
              />
              <Bell size={14} />
              Notificar si fallo
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={formData.notifyOnComplete}
                onChange={(e) => setFormData({ ...formData, notifyOnComplete: e.target.checked })}
                className="rounded"
              />
              <Bell size={14} />
              Notificar si completo
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm"
          >
            Guardar
          </button>
        </form>
      )}

      {accountabilityPartners.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No hay partners agregados
        </div>
      ) : (
        <div className="space-y-2">
          {accountabilityPartners.map(partner => (
            <div key={partner.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {partner.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{partner.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Mail size={12} />
                  {partner.email}
                </div>
                <div className="flex gap-2 mt-1">
                  {partner.notifyOnMiss && (
                    <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">
                      Alerta si fallo
                    </span>
                  )}
                  {partner.notifyOnComplete && (
                    <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">
                      Alerta si completo
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeAccountabilityPartner(partner.id)}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}