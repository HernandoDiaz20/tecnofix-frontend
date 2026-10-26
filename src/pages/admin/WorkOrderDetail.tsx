import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useWorkOrderDetail,
  useWorkOrderHistory,
  useWorkOrderActivities,
  useCreateWorkOrderActivity,
  useWorkOrderPhotos,
  useUploadWorkOrderPhoto,
  useWorkOrderDiagnostics,
  useCreateWorkOrderDiagnostic,
  useTransitionOrderStatus,
  useRegisterExitWorkOrder,
} from '@/api/work-orders';
import type { OrderStatus } from '@/types';
import {
  ArrowLeft,
  Wrench,
  Clock,
  FileCheck,
  Camera,
  FileText,
  Activity as ActivityIcon,
  Send,
  Plus,
  User,
  ShieldCheck,
  Upload,
} from 'lucide-react';

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'INGRESADO', label: 'Ingresado', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { value: 'EN_REVISION', label: 'En Revisión', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'ESPERANDO_REPUESTO', label: 'Esperando Repuesto', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'EN_REPARACION', label: 'En Reparación', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'REPARADO', label: 'Reparado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'LISTO_PARA_ENTREGA', label: 'Listo para Entrega', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'ENTREGADO', label: 'Entregado', color: 'bg-gray-200 text-gray-800 border-gray-300' },
];

export const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: order, isLoading, isError } = useWorkOrderDetail(id);
  const { data: history = [] } = useWorkOrderHistory(id);
  const { data: activities = [] } = useWorkOrderActivities(id);
  const { data: photos = [] } = useWorkOrderPhotos(id);
  const { data: diagnostics = [] } = useWorkOrderDiagnostics(id);

  // Mutations
  const transitionMutation = useTransitionOrderStatus();
  const addActivityMutation = useCreateWorkOrderActivity();
  const uploadPhotoMutation = useUploadWorkOrderPhoto();
  const addDiagnosticMutation = useCreateWorkOrderDiagnostic();
  const exitRegisterMutation = useRegisterExitWorkOrder();

  // Form States
  const [activityText, setActivityText] = useState('');
  const [photoKind, setPhotoKind] = useState<'inicial' | 'final'>('inicial');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Diagnostic form
  const [diagObservations, setDiagObservations] = useState('');
  const [diagFaults, setDiagFaults] = useState('');
  const [diagActions, setDiagActions] = useState('');

  // Exit Register form
  const [exitFinalState, setExitFinalState] = useState('');
  const [exitRepairs, setExitRepairs] = useState('');
  const [exitParts, setExitParts] = useState('');
  const [exitObs, setExitObs] = useState('');

  const [activeTab, setActiveTab] = useState<'general' | 'activities' | 'diagnostics' | 'photos' | 'exit'>('general');

  if (isLoading) {
    return (
      <div className="p-12 text-center text-on-surface-variant font-medium">
        Cargando detalle de la orden de trabajo...
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-12 text-center text-error font-medium">
        No se encontró la orden de trabajo o surgió un error al consultar los datos.
        <div className="mt-4">
          <button
            onClick={() => navigate('/admin/ordenes')}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold"
          >
            Volver a Órdenes
          </button>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await transitionMutation.mutateAsync({
        id: order.id,
        data: { toStatus: newStatus },
      });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al cambiar estado');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityText.trim()) return;

    try {
      await addActivityMutation.mutateAsync({
        id: order.id,
        data: { description: activityText },
      });
      setActivityText('');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al guardar actividad');
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      await uploadPhotoMutation.mutateAsync({
        id: order.id,
        file: selectedFile,
        kind: photoKind,
      });
      setSelectedFile(null);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al subir foto');
    }
  };

  const handleAddDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagObservations.trim() || !diagFaults.trim() || !diagActions.trim()) {
      alert('Todos los campos del diagnóstico son obligatorios.');
      return;
    }

    try {
      await addDiagnosticMutation.mutateAsync({
        id: order.id,
        data: {
          observations: diagObservations,
          faults: diagFaults,
          recommendedActions: diagActions,
        },
      });
      setDiagObservations('');
      setDiagFaults('');
      setDiagActions('');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al registrar diagnóstico');
    }
  };

  const handleExitRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitFinalState.trim() || !exitRepairs.trim()) {
      alert('El estado final y las reparaciones realizadas son obligatorios.');
      return;
    }

    try {
      await exitRegisterMutation.mutateAsync({
        id: order.id,
        data: {
          finalState: exitFinalState,
          repairsPerformed: exitRepairs,
          partsUsed: exitParts,
          observations: exitObs,
        },
      });
      alert('Salida registrada exitosamente');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Error al registrar salida');
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full">
      {/* Top Action & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/ordenes')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al listado de órdenes
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Estado actual:</span>
          <select
            className="bg-surface-container-lowest border border-outline-variant rounded-xl py-2 px-4 text-xs font-bold text-primary focus:border-primary outline-none cursor-pointer"
            value={order.currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Order Info Banner */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-primary font-mono">{order.guideNumber}</h1>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              {order.currentStatus}
            </span>
          </div>
          <p className="text-lg font-bold text-on-surface mt-1">
            {order.deviceBrand} {order.deviceModel}
          </p>
          <p className="text-xs text-on-surface-variant">S/N: {order.deviceSerial || 'No especificado'}</p>
        </div>

        <div className="text-xs text-on-surface-variant space-y-1 text-right">
          <div>Ingresado el: {new Date(order.createdAt).toLocaleString('es-CO')}</div>
          {order.updatedAt && <div>Última actualización: {new Date(order.updatedAt).toLocaleString('es-CO')}</div>}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-outline-variant gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <FileText className="w-4 h-4" /> Información General
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'activities'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ActivityIcon className="w-4 h-4" /> Bitácora de Actividades ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'diagnostics'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Wrench className="w-4 h-4" /> Diagnósticos ({diagnostics.length})
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'photos'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Camera className="w-4 h-4" /> Fotos ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab('exit')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'exit'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Registro de Salida
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Datos del Dispositivo
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">Marca</span>
                  <span className="font-bold text-on-surface">{order.deviceBrand}</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">Modelo</span>
                  <span className="font-bold text-on-surface">{order.deviceModel}</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">Número de Serie / IMEI</span>
                  <span className="font-mono text-on-surface">{order.deviceSerial || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant block font-medium">Clave de Desbloqueo</span>
                  <span className="font-mono text-on-surface">{order.devicePassword || 'Sin clave'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant">
                <span className="text-xs text-on-surface-variant block font-medium">Falla / Problema Reportado</span>
                <p className="text-sm text-on-surface mt-1 bg-surface-container-low p-3 rounded-xl">
                  {order.problemDescription}
                </p>
              </div>

              {order.accessories && (
                <div className="pt-2">
                  <span className="text-xs text-on-surface-variant block font-medium">Accesorios Recibidos</span>
                  <p className="text-sm text-on-surface mt-1">{order.accessories}</p>
                </div>
              )}
            </div>

            {/* Timeline History */}
            <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Historial de Transiciones de Estado
              </h3>

              {history.length === 0 ? (
                <p className="text-xs text-on-surface-variant">No hay historial registrado aún.</p>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-outline-variant">
                  {history.map((h) => (
                    <div key={h.id} className="relative pl-8 text-xs space-y-1">
                      <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-surface -translate-x-1/2" />
                      <div className="font-bold text-on-surface">
                        Cambio de <span className="text-on-surface-variant">{h.fromStatus}</span> a{' '}
                        <span className="text-primary">{h.toStatus}</span>
                      </div>
                      <div className="text-on-surface-variant">
                        {new Date(h.createdAt).toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Asignación
              </h3>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-on-surface-variant block">Cliente Registrado</span>
                  <span className="font-bold text-on-surface">{order.customerId || 'Cliente General'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block">Técnico Asignado</span>
                  <span className="font-bold text-on-surface">{order.technicianId || 'Sin asignar'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-primary" /> Bitácora de Trabajo Técnico
          </h3>

          <form onSubmit={handleAddActivity} className="flex gap-3">
            <input
              type="text"
              required
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
              placeholder="Escribe una observación de la actividad realizada..."
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
            />
            <button
              type="submit"
              disabled={addActivityMutation.isPending}
              className="bg-primary text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Registrar
            </button>
          </form>

          <div className="space-y-3 pt-4 border-t border-outline-variant">
            {activities.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6">
                No hay actividades registradas en la bitácora para esta orden.
              </p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-4 bg-surface-container-low rounded-xl text-sm space-y-1">
                  <div className="flex justify-between items-center text-xs text-on-surface-variant">
                    <span className="font-bold text-primary">Técnico ID: {act.technicianId}</span>
                    <span>{new Date(act.createdAt).toLocaleString('es-CO')}</span>
                  </div>
                  <p className="text-on-surface font-medium">{act.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" /> Informe Diagnóstico de Laboratorio
          </h3>

          <form onSubmit={handleAddDiagnostic} className="space-y-4 bg-surface-container-low p-5 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Observaciones del Técnico *
              </label>
              <input
                type="text"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                placeholder="Ej: Equipo presenta humedad en tarjeta principal..."
                value={diagObservations}
                onChange={(e) => setDiagObservations(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Fallas Detectadas *
              </label>
              <input
                type="text"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                placeholder="Ej: Cortocircuito en línea VDD_MAIN, pin de carga sulfatado..."
                value={diagFaults}
                onChange={(e) => setDiagFaults(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Acciones Recomendadas *
              </label>
              <input
                type="text"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                placeholder="Ej: Limpieza ultrasónica y reemplazo de módulo de carga..."
                value={diagActions}
                onChange={(e) => setDiagActions(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addDiagnosticMutation.isPending}
                className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Agregar Diagnóstico
              </button>
            </div>
          </form>

          <div className="space-y-4 pt-4">
            {diagnostics.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6">
                No hay informes diagnósticos registrados.
              </p>
            ) : (
              diagnostics.map((diag) => (
                <div key={diag.id} className="border border-outline-variant rounded-2xl p-5 space-y-3 bg-surface">
                  <div className="flex justify-between items-center text-xs text-on-surface-variant border-b border-outline-variant pb-2">
                    <span className="font-bold text-primary">Diagnóstico #{diag.id.substring(0, 8)}</span>
                    <span>{new Date(diag.createdAt).toLocaleString('es-CO')}</span>
                  </div>

                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant block">Observaciones:</span>
                      <p className="text-on-surface">{diag.observations}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant block">Fallas:</span>
                      <p className="text-error font-medium">{diag.faults}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface-variant block">Acciones Sugeridas:</span>
                      <p className="text-primary font-medium">{diag.recommendedActions}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> Registro Fotográfico
          </h3>

          <form onSubmit={handleUploadPhoto} className="flex flex-wrap items-center gap-4 bg-surface-container-low p-4 rounded-2xl">
            <select
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 text-xs font-bold outline-none cursor-pointer"
              value={photoKind}
              onChange={(e) => setPhotoKind(e.target.value as 'inicial' | 'final')}
            >
              <option value="inicial">Foto Inicial (Recepción)</option>
              <option value="final">Foto Final (Reparado)</option>
            </select>

            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-on-surface-variant file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />

            <button
              type="submit"
              disabled={!selectedFile || uploadPhotoMutation.isPending}
              className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 ml-auto"
            >
              <Upload className="w-4 h-4" /> Subir Imagen
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center col-span-full py-8">
                No hay fotografías adjuntas a esta orden de trabajo.
              </p>
            ) : (
              photos.map((ph) => (
                <div key={ph.id} className="border border-outline-variant rounded-2xl overflow-hidden bg-surface group">
                  <div className="aspect-video bg-surface-container-high relative overflow-hidden">
                    <img
                      src={ph.publicUrl || ph.storagePath}
                      alt={`Foto ${ph.kind}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                      {ph.kind}
                    </span>
                  </div>
                  <div className="p-3 text-xs text-on-surface-variant">
                    {new Date(ph.uploadedAt).toLocaleString('es-CO')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'exit' && (
        <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" /> Registro de Salida y Entrega
          </h3>

          <form onSubmit={handleExitRegisterSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Estado Final del Dispositivo *
              </label>
              <input
                type="text"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                placeholder="Ej: Entregado funcional al 100%, probado ante cliente"
                value={exitFinalState}
                onChange={(e) => setExitFinalState(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Reparaciones Realizadas *
              </label>
              <textarea
                rows={3}
                required
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                placeholder="Describa el trabajo final realizado..."
                value={exitRepairs}
                onChange={(e) => setExitRepairs(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Repuestos Utilizados
              </label>
              <input
                type="text"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                placeholder="Ej: Display OLED OEM, Batería 3200mAh"
                value={exitParts}
                onChange={(e) => setExitParts(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Observaciones Adicionales
              </label>
              <textarea
                rows={2}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-sm focus:border-primary outline-none"
                placeholder="Recomendaciones de cuidado para el cliente..."
                value={exitObs}
                onChange={(e) => setExitObs(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={exitRegisterMutation.isPending}
              className="bg-primary text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4" /> Confirmar y Registrar Salida
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
