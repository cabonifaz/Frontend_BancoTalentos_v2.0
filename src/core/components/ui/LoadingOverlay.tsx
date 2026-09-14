/**
 * Velo de carga con spinner dentro del contenedor posicionado más cercano
 * (en los modales, el propio diálogo). Es el que mostraban las pestañas
 * mientras llegaban sus datos.
 */
export const LoadingOverlay = () => (
  <div
    role="status"
    aria-label="Cargando"
    className="absolute inset-0 z-50 flex items-center justify-center bg-slate-100 bg-opacity-50 dark:bg-slate-700"
  >
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
    </div>
  </div>
);
