import React, { useState } from 'react';
import { axiosInstanceFMI } from '@/core/services/axiosService';
import { axiosInstance } from '@/core/services/axiosService';
import { Dashboard } from '@/pages/private/Dashboard';
import { ESTADO_REGISTRADO } from '@/core/utilities/constants';
import { enqueueSnackbar } from 'notistack';
import { Loading } from '@/core/components';
import { Button } from '@/core/components/ui/shadcn/button';
import { Input } from '@/core/components/ui/shadcn/input';
import { Dialog, DialogContent, DialogTitle } from '@/core/components/ui/shadcn/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/core/components/ui/shadcn/table';
import { AppSelect } from '@/core/components/ui/AppSelect';
import { Hint } from '@/core/components/ui/Hint';
import { Check, ClipboardCopy, X } from 'lucide-react';

type RequerimientoType = {
  idRequerimiento: number;
  codigoRQ: string;
  titulo: string;
  lstPerfiles: {
    idPerfil: number;
    perfil: string;
  }[];
};

const PantallaGenerarEnlaceRequerimiento: React.FC = () => {
  const [requirementsList, setRequirementsList] = useState<RequerimientoType[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<RequerimientoType[]>([]);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [requirementSearchTerm, setRequirementSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  // Perfil elegido en cada RQ. Antes se leía del DOM con una ref a cada
  // <select>; el Select de Radix no es un <select>, así que ahora es estado.
  const [perfilByRq, setPerfilByRq] = useState<Record<number, number>>({});

  // Sin elección explícita, un RQ con un único perfil lo lleva preseleccionado
  // (el defaultValue que tenía el <select>).
  const perfilDe = (req: RequerimientoType) =>
    perfilByRq[req.idRequerimiento] ??
    (req.lstPerfiles.length === 1 ? req.lstPerfiles[0].idPerfil : 0);

  const fetchRequirements = async (term = '') => {
    try {
      setIsLoading(true);
      const response = await axiosInstanceFMI.get(`/fmi/requirement/list?buscar=${term}&estado=${ESTADO_REGISTRADO}`);
      if (response.data.idTipoMensaje === 2) {
        setRequirementsList(response.data.requerimientos);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequirement = () => {
    fetchRequirements();
    setIsRequirementModalOpen(true);
  };

  const handleSelectRequirement = (requirement: RequerimientoType) => {
    if (!selectedRequirements.some(r => r.idRequerimiento === requirement.idRequerimiento)) {
      setSelectedRequirements(prev => [...prev, requirement]);
    }
  };

  const handleRemoveRequirement = (id: number) => {
    setSelectedRequirements(prev => prev.filter(req => req.idRequerimiento !== id));
  };

  const handleGenerateLink = async () => {
    try {
      const payload = {
        lstRequerimientos: selectedRequirements.map(req => {
          return {
            idRQ: req.idRequerimiento,
            idPerfil: perfilDe(req)
          };
        })
      };

      // check if all RQ have a selected profile
      const allSelected = payload.lstRequerimientos.every(req => req.idPerfil !== 0);
      if (!allSelected) {
        enqueueSnackbar('Por favor seleccione un perfil para cada requerimiento', { variant: 'warning' });
        return;
      }

      setIsLoading(true);
      const response = await axiosInstance.post('/bdt/link/generate', payload);

      if (response.data.idMensaje === 2) {
        setGeneratedLink(response.data.linkToken);
        enqueueSnackbar(response.data.mensaje, { variant: 'success' });
      }
    } catch (error) {
      console.error('Error generating link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Error al copiar: ', err);
        });
    }
  };

  const handleRQSelect = (idRQ: number, value: string) => {
    setPerfilByRq(prev => ({ ...prev, [idRQ]: Number(value) }));
    if (value) {
      setSelectedRequirements(prev => prev.map(req => {
        if (req.idRequerimiento === idRQ) {
          return {
            ...req,
            lstPerfiles: req.lstPerfiles.map(perf => ({
              ...perf,
              selected: perf.idPerfil === parseInt(value)
            }))
          };
        }
        return req;
      }));
    }
  }

  return (
    <Dashboard>
      {isLoading && (<Loading opacity="opacity-60" />)}
      <div className="flex h-full flex-col overflow-x-hidden">
        <div className="flex shrink-0 items-center justify-between mb-5">
          <h3 className="text-2xl font-semibold">Generación de enlace</h3>

          {/* Agregar Requerimiento section */}
          <div className="flex items-center gap-4">
            <Button variant="blue" onClick={handleAddRequirement} className="mx-1">
              Agregar Requerimiento
            </Button>
          </div>
        </div>

        {/* Selected requirements table */}
        <div className="table-container shrink-0">
          <div className="table-wrapper max-h-[50vh] overflow-auto">
            <Table className="table">
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead className="table-header-cell text-center">ID</TableHead>
                  <TableHead className="table-header-cell text-center">Título</TableHead>
                  <TableHead className="table-header-cell text-center">Código RQ</TableHead>
                  <TableHead className="table-header-cell text-center">Perfil</TableHead>
                  <TableHead className="table-header-cell text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {selectedRequirements.map((req) => (
                  <TableRow key={req.idRequerimiento} className="table-row">
                    <TableCell className="table-cell text-center">{req.idRequerimiento}</TableCell>
                    <TableCell className="table-cell text-center">{req.titulo}</TableCell>
                    <TableCell className="table-cell text-center">{req.codigoRQ}</TableCell>
                    <TableCell className="table-cell text-center">
                      <AppSelect
                        aria-label={`Perfil para ${req.codigoRQ}`}
                        className="mx-auto h-auto w-auto gap-2 px-3 py-2 text-sm"
                        value={perfilDe(req)}
                        onChange={(v) => handleRQSelect(req.idRequerimiento, v)}
                        options={(req.lstPerfiles ?? []).map((perf) => ({
                          value: perf.idPerfil,
                          label: perf.perfil,
                        }))}
                        placeholder="Seleccione un perfil"
                      />
                    </TableCell>
                    <TableCell className="table-cell text-center">
                      <Button
                        variant="destructive"
                        onClick={() => handleRemoveRequirement(req.idRequerimiento)}
                        className="mx-1 rounded text-xs"
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {selectedRequirements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="table-empty">
                      No hay requerimientos seleccionados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Generate link section */}
        <div className="flex shrink-0 flex-col gap-4 mt-6">
          <Button onClick={handleGenerateLink} className="mx-1 w-fit">
            Generar enlace
          </Button>

          {generatedLink && (
            <div className="w-full">
              <div className="relative flex items-center group">
                <Input
                  type="text"
                  aria-label="Enlace generado"
                  value={generatedLink}
                  readOnly
                />
                <Hint label="Copiar enlace">
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="absolute right-2 p-2 rounded-md transition-colors bg-white group-hover:bg-gray-100 dark:bg-slate-800 dark:group-hover:bg-slate-700"
                    aria-label="Copiar enlace"
                  >
                    {isCopied ? (
                      <Check className="h-5 w-5 text-green-500" aria-hidden />
                    ) : (
                      <ClipboardCopy className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200" aria-hidden />
                    )}
                  </button>
                </Hint>
              </div>
            </div>
          )}
        </div>

        {/* Requirement Selection Modal */}
        {isRequirementModalOpen && (
          // Escape cierra como la X; un clic fuera no (como antes).
          <Dialog open onOpenChange={(open) => { if (!open) setIsRequirementModalOpen(false); }}>
            <DialogContent
              className="flex w-[calc(100%-2rem)] max-w-md max-h-[80vh] flex-col gap-0 p-0"
              onInteractOutside={(e) => e.preventDefault()}
            >
              <div className="p-4 border-b flex justify-between items-center dark:border-slate-700">
                <DialogTitle className="text-xl font-semibold">Buscar requerimiento</DialogTitle>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setIsRequirementModalOpen(false)}
                  className="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-50"
                >
                  <X className="w-6 h-6" aria-hidden />
                </button>
              </div>

              <div className="p-4 border-b dark:border-slate-700">
                <div className="flex items-center">
                  <div className="relative flex-grow">
                    <Input
                      type="text"
                      aria-label="Buscar requerimiento"
                      placeholder="Buscar por título o código RQ"
                      className="px-4 py-2 pr-10"
                      value={requirementSearchTerm}
                      onChange={(e) => setRequirementSearchTerm(e.target.value)}
                    />
                    {requirementSearchTerm && (
                      <button
                        type="button"
                        aria-label="Limpiar búsqueda"
                        onClick={() => {
                          setRequirementSearchTerm('');
                          fetchRequirements('');
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <X className="w-5 h-5" aria-hidden />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={() => fetchRequirements(requirementSearchTerm)}
                    className="ml-3 shrink-0"
                  >
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="overflow-y-auto flex-grow">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                    Cargando requerimientos...
                  </div>
                ) : requirementsList.length > 0 ? (
                  requirementsList.map((req) => {
                    const isSelected = selectedRequirements.some(r => r.idRequerimiento === req.idRequerimiento);
                    return (
                      <div key={req.idRequerimiento} className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                        <div>
                          <p className="font-medium">{req.codigoRQ}</p>
                          <p className="text-sm text-zinc-500 font-medium dark:text-slate-400">{req.titulo}</p>
                        </div>
                        <Button
                          variant="blue"
                          onClick={() => !isSelected && handleSelectRequirement(req)}
                          disabled={isSelected}
                          className="mx-1"
                        >
                          {isSelected ? 'Seleccionado' : 'Seleccionar'}
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                    {requirementSearchTerm
                      ? "No se encontraron requerimientos con ese criterio de búsqueda"
                      : "Ingrese un término para buscar requerimientos"}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Dashboard>
  );
};

export default PantallaGenerarEnlaceRequerimiento;
