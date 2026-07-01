import { useEffect } from "react";
import { Users } from "lucide-react";
import { useFetchClientContacts } from "../../hooks/useFetchClientContacts";
import { ReqContacto } from "../../models/interfaces/ReqContacto";
import { SearchableSelect } from "./SearchableSelect";

interface Props {
  /** Cliente del que se cargan los contactos registrados. */
  idCliente: number | null;
  /** Se invoca al elegir un contacto para agregarlo como entrevistador. */
  onAdd: (interviewer: { fullname: string; email: string }) => void;
  /** Correos ya agregados, para no ofrecerlos por duplicado. */
  addedEmails?: string[];
}

const buildFullName = (c: ReqContacto) =>
  [c.nombre, c.apellidoPaterno, c.apellidoMaterno]
    .filter(Boolean)
    .join(" ")
    .trim();

/**
 * Selector de clientes registrados (contactos del cliente) para agregarlos
 * como entrevistadores. Se usa en la etapa "Entrevista técnica con cliente"
 * sin reemplazar la opción de agregar entrevistadores manualmente.
 */
export const ClientInterviewerSelect = ({
  idCliente,
  onAdd,
  addedEmails = [],
}: Props) => {
  const { contactos, loading, fetchContacts } = useFetchClientContacts();

  useEffect(() => {
    if (idCliente) fetchContacts(idCliente);
  }, [idCliente, fetchContacts]);

  const normalizedAdded = addedEmails.map((e) => e.toLowerCase());

  const options = contactos
    .filter(
      (c) =>
        !c.correo || !normalizedAdded.includes(c.correo.toLowerCase()),
    )
    .map((c) => ({
      value: c.idClienteContacto,
      label: c.correo
        ? `${buildFullName(c)} · ${c.correo}`
        : buildFullName(c),
    }));

  const handleChange = (value: string | number) => {
    const contacto = contactos.find(
      (c) => c.idClienteContacto === Number(value),
    );
    if (!contacto) return;
    onAdd({ fullname: buildFullName(contacto), email: contacto.correo || "" });
  };

  return (
    <div className="mb-4 rounded-lg border border-dashed border-[var(--color-blue)] bg-[var(--color-blue-10)] p-4">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-blue)] mb-2">
        <Users className="w-3.5 h-3.5" />
        Agregar cliente registrado
      </label>
      {idCliente ? (
        <>
          <SearchableSelect
            options={options}
            value=""
            onChange={handleChange}
            placeholder={
              loading
                ? "Cargando clientes..."
                : options.length === 0
                  ? "No hay clientes disponibles"
                  : "Selecciona un cliente registrado"
            }
            disabled={loading || options.length === 0}
          />
          <p className="text-xs text-gray-500 mt-2">
            Al seleccionar un cliente se agrega como entrevistador. También
            puedes agregar entrevistadores manualmente.
          </p>
        </>
      ) : (
        <p className="text-xs text-gray-500">
          Selecciona un requerimiento para cargar los clientes registrados.
        </p>
      )}
    </div>
  );
};
