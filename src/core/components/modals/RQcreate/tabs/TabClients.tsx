import { useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../../../models/schemas/NewRQSchemaV1";
import { Client } from "../../../../models/interfaces/Client";
import { useFetchClientContacts } from "../../../../hooks/useFetchClientContacts";
import { useEffect, useState } from "react";
import { Loading } from "../../../ui/Loading";
import { ReqContacto } from "../../../../models/interfaces/ReqContacto";
import { ModalRQContactV2 } from "../../ModalContactV2";

interface TabProps {
  clients: Client[];
  fetchTarifario: (clientId: number) => Promise<void>;
}

export const TabClients = ({ clients, fetchTarifario }: TabProps) => {
  // @marker base state
  const [selContacts, setSelContacts] = useState<number[]>([]);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [contactToEdit, setContactToEdit] =
    useState<ReqContacto | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    contactos: contacts,
    loading: loadingContacts,
    fetchContacts,
  } = useFetchClientContacts();

  const {
    register,
    formState: { errors },
    clearErrors,
    setValue,
    getValues,
  } = useFormContext<newRQSchemaType>();

  // Sincronizar la lista de contactos con el Schema
  useEffect(() => {
    setValue("lstContactos", selContacts, { shouldValidate: true });
  }, [selContacts, setValue]);

  const handleClienteChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedClienteId = Number(event.target.value);
    setValue("idCliente", selectedClienteId);
    clearErrors();

    setSelContacts([]);
    fetchContacts(selectedClienteId);
    // Cargar tarifario para el cliente seleccionado
    // Limpiar lista de vacantes
    if (selectedClienteId > 0) {
      fetchTarifario(selectedClienteId);
      setValue("lstVacantes", []);
    }
  };

  const handleAddContact = () => {
    setModalMode("add");
    setContactToEdit(null);
    setIsModalOpen(true);
  };

  const handleContactToggle = (contactId: number) => {
    setSelContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleEditContact = (contact: ReqContacto) => {
    setModalMode("edit");
    setContactToEdit(contact);
    setIsModalOpen(true);
  };

  const handleContactAdded = () => {
    fetchContacts(getValues("idCliente"));
    setIsModalOpen(false);
    setContactToEdit(null);
    setModalMode("add");
    setSelContacts([]);
  };

  const handleContactUpdated = () => {
    fetchContacts(getValues("idCliente"));
    setIsModalOpen(false);
    setContactToEdit(null);
    setModalMode("add");
    setSelContacts([]);
  };

  return (
    <>
      {loadingContacts && <Loading opacity="opacity-50" />}
      {isModalOpen && (
        <ModalRQContactV2
          onClose={() => setIsModalOpen(false)}
          RQState="new"
          onContactAdded={handleContactAdded}
          onContactUpdated={handleContactUpdated}
          modalMode={modalMode}
          contact={contactToEdit}
          idCliente={getValues("idCliente")}
        />
      )}
      <div className="flex h-full min-h-0 flex-col">
        {/* Cliente */}
        <div className="flex items-center">
          <label className="w-1/3 text-sm font-medium text-gray-700">
            Cliente:
          </label>
          <select
            {...register("idCliente", {
              valueAsNumber: true,
            })}
            onChange={handleClienteChange}
            defaultValue={0}
            className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
          >
            <option value={0} disabled>
              Elija un cliente
            </option>
            {clients.map((c) => (
              <option key={c.idCliente} value={c.idCliente}>
                {c.razonSocial}
              </option>
            ))}
          </select>
        </div>
        {errors.idCliente && (
          <p className="text-red-500 text-sm mt-1 ml-[33%]">
            {errors.idCliente.message}
          </p>
        )}

        <div className="flex items-center justify-between my-4">
          <h2 className="text-sm font-medium text-gray-700">
            Lista de Contactos
          </h2>
          <button
            type="button"
            onClick={handleAddContact}
            disabled={getValues("idCliente") === 0}
            className={`btn text-sm font-medium ${
              getValues("idCliente") === 0
                ? "btn-disabled"
                : "btn-blue"
            }`}
          >
            Añadir contacto
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="table-container">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr className="table-header">
                    <th scope="col" className="table-header-cell">
                      ID
                    </th>
                    <th scope="col" className="table-header-cell">
                      Nombres
                    </th>
                    <th scope="col" className="table-header-cell">
                      Apellidos
                    </th>
                    <th scope="col" className="table-header-cell">
                      Celular
                    </th>
                    <th scope="col" className="table-header-cell">
                      Correo
                    </th>
                    <th scope="col" className="table-header-cell">
                      Cargo
                    </th>
                    <th scope="col" className="table-header-cell">
                      Asignado
                    </th>
                    <th
                      scope="col"
                      className="table-header-cell"
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length <= 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty">
                        No hay contactos disponibles.
                      </td>
                    </tr>
                  ) : (
                    contacts?.map((c) => (
                      <tr
                        key={c.idClienteContacto}
                        className="table-row"
                      >
                        <td className="table-cell">
                          {c.idClienteContacto}
                        </td>
                        <td className="table-cell">{c.nombre}</td>
                        <td className="table-cell">
                          {c.apellidoPaterno +
                            " " +
                            c.apellidoMaterno}
                        </td>
                        <td className="table-cell">{c.telefono}</td>
                        <td className="table-cell">{c.correo}</td>
                        <td className="table-cell">{c.cargo}</td>
                        <td className="table-cell">
                          <input
                            type="checkbox"
                            className="input-checkbox"
                            name={`contact-${c.idClienteContacto}`}
                            id={`contact-${c.idClienteContacto}`}
                            checked={selContacts.includes(
                              c.idClienteContacto
                            )}
                            onChange={() =>
                              handleContactToggle(c.idClienteContacto)
                            }
                          />
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditContact(c)}
                              className="w-7 h-7"
                            >
                              <img
                                src="/assets/ic_edit.svg"
                                alt="edit icon"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
