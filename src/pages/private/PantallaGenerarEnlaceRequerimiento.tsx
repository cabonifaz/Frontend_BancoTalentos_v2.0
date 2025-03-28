import React, { useState } from 'react';
import { axiosInstanceFMI } from '../../core/services/axiosService';
import { axiosInstance } from '../../core/services/axiosService';
import { Dashboard } from './Dashboard';
import { ESTADO_ASIGNADO } from '../../core/utilities/constants';

type RequerimientoType = {
  idRequerimiento: number;
  codigoRQ: string;
};

const PantallaGenerarEnlaceRequerimiento: React.FC = () => {
  const [requirementsList, setRequirementsList] = useState<RequerimientoType[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<RequerimientoType[]>([]);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [requirementSearchTerm, setRequirementSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchRequirements = async (term = '') => {
    try {
      setIsLoading(true);
      const response = await axiosInstanceFMI.get(`/fmi/requirement/list?codigoRQ=${term}&estado=${ESTADO_ASIGNADO}`);
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
      setIsLoading(true);
      const response = await axiosInstance.post('/bdt/link/generate', {
        lstRequerimientos: selectedRequirements.map(req => req.idRequerimiento)
      });

      if (response.data.idMensaje === 2) {
        console.log("Link generado:", response.data.linkToken);
        setGeneratedLink(response.data.linkToken);
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
          setTimeout(() => setIsCopied(false), 2000); // Vuelve al ícono original después de 2 segundos
        })
        .catch(err => {
          console.error('Error al copiar: ', err);
        });
    }
  };

  return (
    <Dashboard>
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-semibold">Generación de enlace</h3>

          {/* Agregar Requerimiento section */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddRequirement}
              className="btn btn-blue"
            >
              Agregar Requerimiento
            </button>
          </div>

          {/* Selected requirements table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="py-3 px-4 text-left font-semibold">ID</th>
                    <th className="py-3 px-4 text-left font-semibold">CODIGO RQ</th>
                    <th className="py-3 px-4 text-left font-semibold">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRequirements.map(req => (
                    <tr key={req.idRequerimiento} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">{req.idRequerimiento}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{req.codigoRQ}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveRequirement(req.idRequerimiento)}
                          className="btn btn-red"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedRequirements.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-500">
                        No hay requerimientos seleccionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generate link section */}
          <div className="flex flex-col gap-4 mt-4">
            <button
              onClick={handleGenerateLink}
              className="btn btn-primary w-fit"
            >
              Generar enlace
            </button>

            {generatedLink && (
              <div className="w-full">
                <div className="relative flex items-center group">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="w-full input"
                  />
                  <button
                    onClick={handleCopyToClipboard}
                    className="absolute right-2 p-2 rounded-md transition-colors bg-white group-hover:bg-gray-100"
                    aria-label="Copiar enlace"
                  >
                    {isCopied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span className="absolute -top-8 -left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Copiar enlace
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Requirement Selection Modal */}
        {isRequirementModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Buscar requerimiento</h2>
                <button
                  onClick={() => setIsRequirementModalOpen(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Buscar por código RQ"
                      className="w-full px-4 py-2 border rounded-lg pr-10"
                      value={requirementSearchTerm}
                      onChange={(e) => setRequirementSearchTerm(e.target.value)}
                    />
                    {requirementSearchTerm && (
                      <button
                        onClick={() => {
                          setRequirementSearchTerm('');
                          fetchRequirements('');
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => fetchRequirements(requirementSearchTerm)}
                    className="btn btn-primary"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-grow">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Cargando requerimientos...
                  </div>
                ) : requirementsList.length > 0 ? (
                  requirementsList.map((req) => {
                    const isSelected = selectedRequirements.some(r => r.idRequerimiento === req.idRequerimiento);
                    return (
                      <div key={req.idRequerimiento} className="flex items-center justify-between p-4 border-b">
                        <div>
                          <p className="font-medium">{req.codigoRQ}</p>
                        </div>
                        <button
                          onClick={() => !isSelected && handleSelectRequirement(req)}
                          disabled={isSelected}
                          className={`btn ${isSelected
                            ? 'btn-disabled'
                            : 'btn-blue'
                            }`}
                        >
                          {isSelected ? 'Seleccionado' : 'Seleccionar'}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {requirementSearchTerm
                      ? "No se encontraron requerimientos con ese criterio de búsqueda"
                      : "Ingrese un término para buscar requerimientos"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Dashboard>
  );
};

export default PantallaGenerarEnlaceRequerimiento;