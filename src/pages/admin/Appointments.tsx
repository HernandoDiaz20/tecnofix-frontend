import React, { useState } from 'react';
import {
  useAdminAppointments,
  useCancelAppointment,
  useConfirmAppointment,
  useCompleteAppointment,
  useConvertAppointmentToOrder,
  useAdminWorkOrders,
} from '@/api/admin-hooks';
import { useAdminCustomers } from '@/api/admin/customer-hooks';
import { useServices } from '@/api/hooks';
import type { DashboardAppointment } from '@/types/dashboard';
import type { WorkOrder } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, CheckCircle2, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Appointments: React.FC = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [statusFilter, setStatusFilter] = useState('');

  // Track which appointment is currently running an action
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Error state if work order creation fails after appointment confirmation
  const [orderCreationError, setOrderCreationError] = useState<{
    appointment: DashboardAppointment;
    message: string;
  } | null>(null);

  // Selected appointment for Cancel Dialog
  const [cancelingAppointment, setCancelingAppointment] = useState<DashboardAppointment | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Success state for newly created order
  const [lastCreatedOrder, setLastCreatedOrder] = useState<WorkOrder | null>(null);

  // Query hooks
  const { data, isLoading, isError, refetch } = useAdminAppointments(page, pageSize, statusFilter);
  const { data: rawServices } = useServices();
  const { data: customersData } = useAdminCustomers(1, 100);
  const { data: workOrdersData } = useAdminWorkOrders(1, 50);

  // Mutation hooks
  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();
  const completeMutation = useCompleteAppointment();
  const convertOrderMutation = useConvertAppointmentToOrder();

  const services: any[] = Array.isArray(rawServices)
    ? rawServices
    : ((rawServices as any)?.items || (rawServices as any)?.services || []);

  const getServiceName = (serviceId?: string) => {
    if (!serviceId) return 'Servicio general';
    const found = services.find((s) => s.id === serviceId);
    return found ? found.name : 'Servicio técnico especializado';
  };

  const appointments: DashboardAppointment[] = data?.items || [];
  const total = data?.total ?? appointments.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const getStatusBadge = (status: DashboardAppointment['status']) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pendiente
          </span>
        );
      case 'confirmada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Aceptada
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Completada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status || 'Registrada'}
          </span>
        );
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // 1. Direct Accept action — executes the full automated flow without opening a second form
  const handleAccept = async (appt: DashboardAppointment) => {
    setActionLoadingId(appt.id);
    setLastCreatedOrder(null);
    setOrderCreationError(null);

    try {
      // Step A: Confirm appointment on backend via PATCH /appointments/:id/confirm (sets status to "confirmada" / Aceptada)
      // Only call confirm if not already confirmed (avoids redundant calls on retry)
      if (appt.status !== 'confirmada') {
        await confirmMutation.mutateAsync(appt.id);
      }

      // Step B: Deduplication check — check if an order was already created for this appointment
      const serviceName = getServiceName(appt.serviceId);
      const existingOrders = workOrdersData?.items || [];
      const duplicateOrder = existingOrders.find(
        (o) =>
          (o.appointmentId && o.appointmentId === appt.id) ||
          o.problemDescription?.includes(`[Cita: ${appt.id}]`) ||
          (o.problemDescription?.includes(appt.customerName) &&
            o.problemDescription?.includes(serviceName))
      );

      if (duplicateOrder) {
        setLastCreatedOrder(duplicateOrder as any);
        toast({
          title: 'Cita Aceptada (Orden Existente)',
          description: `La cita quedó aceptada. Ya existe una orden registrada para esta solicitud con Guía: ${duplicateOrder.guideNumber}`,
        });
        refetch();
        return;
      }

      // Step C: Match registered customer ID from backend customers directory if available
      const matchingCustomer = customersData?.items?.find(
        (c) =>
          (c.phone && appt.phone && c.phone.trim() === appt.phone.trim()) ||
          c.fullName?.toLowerCase().trim() === appt.customerName?.toLowerCase().trim()
      );

      // Step D: Map existing persisted fields and convert via POST /appointments/:id/convert
      // This uses backend idempotency and links appointment_id on work_orders
      const result = await convertOrderMutation.mutateAsync({
        id: appt.id,
        payload: {
          deviceBrand: appt.deviceBrand,
          deviceModel: appt.deviceModel,
          deviceSerial: appt.deviceSerial,
          problemDescription:
            appt.problemDescription ||
            `Servicio agendado: ${serviceName}. Cliente: ${appt.customerName} (Tel: ${appt.phone || 'N/D'}). Fecha: ${formatDateTime(appt.date)} [Cita: ${appt.id}]`,
          customerId: matchingCustomer ? matchingCustomer.id : null,
        },
      });

      const newOrder = result.workOrder;
      setLastCreatedOrder(newOrder);

      toast({
        title: '¡Cita Aceptada y Orden Creada!',
        description: `Se ingresó la orden al taller con Número de Guía: ${newOrder.guideNumber}`,
      });
      refetch();
    } catch (err: any) {
      const errorDetails = err?.response?.data?.error;
      const isMissingSerial =
        errorDetails?.code === 'VALIDATION_ERROR' &&
        errorDetails?.details?.fieldErrors?.deviceSerial;

      const isMissingFields =
        isMissingSerial ||
        (errorDetails?.code === 'VALIDATION_ERROR' &&
          (errorDetails?.details?.fieldErrors?.deviceBrand ||
            errorDetails?.details?.fieldErrors?.deviceModel));

      if (isMissingFields) {
        // The appointment is confirmed/Aceptada, but backend POST /appointments/:id/convert rejected
        // because deviceSerial is required by backend validation schema.
        setOrderCreationError({
          appointment: appt,
          message:
            "La cita quedó Aceptada (confirmada) en el servidor. La orden no se pudo crear automáticamente porque el contrato del backend exige obligatoriamente 'deviceSerial' ('El serial del dispositivo es obligatorio') al convertir la cita en orden, pero el formulario público de citas no recolecta número de serie/IMEI.",
        });
        toast({
          title: 'Cita Aceptada — Serial requerido por Backend',
          description:
            "La cita fue confirmada. El backend requiere el serial del dispositivo ('deviceSerial') para generar la orden en taller.",
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error al procesar la cita',
          description:
            errorDetails?.message || err?.message || 'Ocurrió un problema al procesar la orden.',
          variant: 'destructive',
        });
      }
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Direct Complete action (service done on the spot, NO work order created)
  const handleComplete = async (appt: DashboardAppointment) => {
    setActionLoadingId(appt.id);
    try {
      // Backend requires appointment to be confirmed before completing
      if (appt.status === 'pendiente') {
        await confirmMutation.mutateAsync(appt.id);
      }

      const serviceName = getServiceName(appt.serviceId);
      await completeMutation.mutateAsync({
        id: appt.id,
        payload: {
          completedServices: serviceName || 'Servicio realizado en el momento',
        },
      });

      toast({
        title: 'Cita Completada',
        description: `El servicio de ${appt.customerName} fue completado en el momento sin ingresar al taller.`,
      });
      refetch();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        toast({
          title: 'Función pendiente en el servidor',
          description:
            'El backend no tiene implementada la ruta para completar citas directamente (PATCH /appointments/:id/complete retornó 404).',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error al completar cita',
          description:
            err?.response?.data?.error?.message ||
            err?.message ||
            'No se pudo actualizar el estado de la cita.',
          variant: 'destructive',
        });
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Confirm Cancel action
  const handleConfirmCancel = async () => {
    if (!cancelingAppointment) return;
    setCancelError(null);

    try {
      await cancelMutation.mutateAsync(cancelingAppointment.id);
      toast({
        title: 'Cita Cancelada',
        description: `La cita de ${cancelingAppointment.customerName} ha sido cancelada correctamente.`,
      });
      setCancelingAppointment(null);
      refetch();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        'No se pudo cancelar la cita. Por favor intenta de nuevo.';
      setCancelError(msg);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Citas Agendadas</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Gestión y atención de citas: completa en el momento o acepta para ingreso a taller.
          </p>
        </div>
      </div>

      {/* Success Notification Banner when an order is created */}
      {lastCreatedOrder && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-950">
                ¡Orden de Servicio Ingresada al Taller con Éxito!
              </p>
              <p className="text-xs text-emerald-800">
                Número de Guía: <strong className="font-mono text-sm">{lastCreatedOrder.guideNumber}</strong> |
                Dispositivo: {lastCreatedOrder.deviceBrand || 'Dispositivo'} {lastCreatedOrder.deviceModel}
              </p>
            </div>
          </div>
          <Link
            to={`/admin/ordenes-servicio/${lastCreatedOrder.id}`}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0 shadow-xs"
          >
            Ver Detalle de la Orden <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Backend Dependency Banner if order creation failed due to missing backend fields */}
      {orderCreationError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-950">
                Cita Aceptada — Pendiente Creación Automática de Orden
              </p>
              <p className="mt-0.5 max-w-2xl text-amber-800">{orderCreationError.message}</p>
            </div>
          </div>
          <button
            onClick={() => handleAccept(orderCreationError.appointment)}
            disabled={actionLoadingId === orderCreationError.appointment.id}
            className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar Creación
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Filtrar por estado:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aceptada">Aceptadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        <button
          onClick={() => refetch()}
          className="text-xs font-medium text-primary hover:text-primary-container flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Actualizar
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low/50 text-on-surface-variant font-medium text-xs">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Servicio Solicitado</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Registrada el</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-on-surface">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-primary text-2xl">
                        progress_activity
                      </span>
                      <span>Cargando citas...</span>
                    </div>
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-error">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-3xl">error</span>
                      <span className="font-semibold">Error al cargar las citas del servidor</span>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 text-xs font-semibold text-primary underline"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && appointments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-2xl">event_busy</span>
                      </div>
                      <p className="font-medium text-base text-on-surface">No se encontraron citas</p>
                      <p className="text-xs text-outline max-w-sm">
                        {statusFilter
                          ? 'No hay citas registradas con el estado seleccionado.'
                          : 'Aún no hay citas agendadas por los clientes.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                appointments.map((appt) => {
                  const isActionLoading = actionLoadingId === appt.id;

                  return (
                    <tr
                      key={appt.id}
                      className="hover:bg-surface-container-low/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-on-surface">
                        {appt.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {appt.phone ? (
                          <a
                            href={`tel:${appt.phone}`}
                            className="hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">call</span>
                            {appt.phone}
                          </a>
                        ) : (
                          <span className="text-outline">Sin teléfono</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-on-surface">
                        {getServiceName(appt.serviceId)}
                      </td>
                      <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-sm">
                            schedule
                          </span>
                          {formatDateTime(appt.date)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(appt.status)}</td>
                      <td className="py-3.5 px-4 text-xs text-on-surface-variant">
                        {appt.createdAt ? formatDateTime(appt.createdAt) : 'N/D'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {appt.status === 'pendiente' && (
                            <>
                              {/* Acción Aceptar e Ingresar al Taller (ejecución automática directa sin segundo formulario) */}
                              <button
                                onClick={() => handleAccept(appt)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all disabled:opacity-50"
                                title="Aceptar cita e ingresar automáticamente al taller"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <span className="material-symbols-outlined text-sm">
                                    check_circle
                                  </span>
                                )}
                                <span>Aceptar e ingresar al taller</span>
                              </button>

                              {/* Acción Completada (servicio en el momento sin ingresar al taller) */}
                              <button
                                onClick={() => handleComplete(appt)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs transition-all disabled:opacity-50"
                                title="Marcar como completada en el momento (sin orden de taller)"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <span className="material-symbols-outlined text-sm">
                                    task_alt
                                  </span>
                                )}
                                Completar
                              </button>

                              {/* Acción Cancelar */}
                              <button
                                onClick={() => {
                                  setCancelingAppointment(appt);
                                  setCancelError(null);
                                }}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                title="Cancelar cita"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Cancelar
                              </button>
                            </>
                          )}

                          {appt.status === 'confirmada' && (
                            <>
                              {/* Ya Aceptada: botón para reintentar la creación de la orden si falló previamente */}
                              <button
                                onClick={() => handleAccept(appt)}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 border border-primary text-primary hover:bg-primary/5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                                title="Reintentar generación de orden de taller para esta cita"
                              >
                                {isActionLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <span className="material-symbols-outlined text-sm">add_task</span>
                                )}
                                Reintentar Orden
                              </button>
                              <button
                                onClick={() => {
                                  setCancelingAppointment(appt);
                                  setCancelError(null);
                                }}
                                disabled={isActionLoading}
                                className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors"
                                title="Cancelar cita"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Cancelar
                              </button>
                            </>
                          )}

                          {appt.status === 'completada' && (
                            <span className="text-xs text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                              Atendido en el momento
                            </span>
                          )}

                          {appt.status === 'cancelada' && (
                            <span className="text-xs text-outline italic">Cancelada</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant/50 flex items-center justify-between text-xs text-on-surface-variant">
            <span>
              Página {page} de {totalPages} ({total} citas en total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-low"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={!!cancelingAppointment}
        onOpenChange={(open) => !cancelMutation.isPending && !open && setCancelingAppointment(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Cancelar Cita
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant text-sm">
              ¿Estás seguro de que deseas cancelar la cita técnica de{' '}
              <strong>{cancelingAppointment?.customerName}</strong> programada para el{' '}
              <strong>{cancelingAppointment ? formatDateTime(cancelingAppointment.date) : ''}</strong>?
            </DialogDescription>
          </DialogHeader>

          {cancelError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {cancelError}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={cancelMutation.isPending}
              onClick={() => setCancelingAppointment(null)}
            >
              Volver
            </Button>
            <Button
              type="button"
              disabled={cancelMutation.isPending}
              onClick={handleConfirmCancel}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelación'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
