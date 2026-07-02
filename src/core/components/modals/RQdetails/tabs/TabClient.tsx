import { useFormContext } from "react-hook-form";
import { UpdateBaseRQSchemaType } from "../../../../models/schemas/UpdateBaseRQSchema";
import { Client } from "../../../../models/interfaces/Client";
import { ReqContacto } from "../../../../models/interfaces/ReqContacto";
import { ModalRQContactV2 } from "../../ModalContactV2";
import { useState } from "react";

interface TabProps {
  rqId: number;
  clients: Client[];
  contacts: ReqContacto[];
  fetchRequirement: () => void;
}

export const TabClient = ({
  rqId,
  clients,
  contacts,
  fetchRequirement,
}: TabProps) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext<UpdateBaseRQSchemaType>();

  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] =
    useState<ReqContacto | null>(null);

  const handleEditContact = (contact: ReqContacto) => {
    setModalMode("edit");
    setContactToEdit(contact);
    setIsModalOpen(true);
  };

  const handleContactAdded = () => {
    fetchRequirement();
    setContactToEdit(null);
    setModalMode("add");
  };

  const handleContactUpdated = () => {
    fetchRequirement();
    setContactToEdit(null);
    setModalMode("add");
  };

  const handleAddContact = () => {
    console.log("Hola");
    setModalMode("add");
    setContactToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <>
      {isModalOpen && (
        <ModalRQContactV2
          onClose={() => setIsModalOpen(false)}
          RQState="existing"
          onContactAdded={handleContactAdded}
          onContactUpdated={handleContactUpdated}
          modalMode={modalMode}
          contact={contactToEdit}
          idRQ={rqId}
          idCliente={getValues("idCliente")}
        />
      )}
      <div className="flex h-full min-h-0 flex-col">
        {/* Cliente */}
        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-700">
            Cliente:
          </label>
          <select
            {...register("idCliente", {
              valueAsNumber: true,
            })}
            disabled={true}
            aria-readonly={true}
            className="px-3 py-2 border-none outline-none appearance-none"
          >
            {clients.map((client) => (
              <option key={client.idCliente} value={client.idCliente}>
                {client.razonSocial}
              </option>
            ))}
          </select>
        </div>
        {errors.idCliente && (
          <p className="text-red-500 text-sm mt-1 ml-[33%]">
            {errors.idCliente.message}
          </p>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">
            Lista de contactos
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

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto custom-scroll">
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
                  {(contacts || []).length <= 0 ? (
                    <tr>
                      <td colSpan={8} className="table-empty">
                        No hay contactos disponibles.
                      </td>
                    </tr>
                  ) : (
                    contacts?.map((contact) => (
                      <tr
                        key={contact.idClienteContacto}
                        className="table-row"
                      >
                        <td className="table-cell">
                          {contact.idClienteContacto}
                        </td>
                        <td className="table-cell">
                          {contact.nombre}
                        </td>
                        <td className="table-cell">
                          {contact.apellidoPaterno +
                            " " +
                            contact.apellidoMaterno}
                        </td>
                        <td className="table-cell">
                          {contact.telefono}
                        </td>
                        <td className="table-cell">
                          {contact.correo}
                        </td>
                        <td className="table-cell">
                          {contact.cargo}
                        </td>
                        <td className="table-cell">
                          <input
                            type="checkbox"
                            name="contact-asig"
                            id="contact-asig"
                            checked={contact.asignado === 1}
                            readOnly={true}
                            className="input-checkbox-readonly"
                          />
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEditContact(contact)
                              }
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
