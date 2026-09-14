import { Pencil, Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { UpdateBaseRQSchemaType } from "@/core/models/schemas/UpdateBaseRQSchema";
import { Client } from "@/core/models/interfaces/Client";
import { ReqContacto } from "@/core/models/interfaces/ReqContacto";
import { ModalRQContactV2 } from "@/core/components/requerimientos/modals/ModalContactV2";
import { useState } from "react";
import { Button } from "@/core/components/ui/shadcn/button";
import { Badge } from "@/core/components/ui/shadcn/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/shadcn/table";
import { cn } from "@/core/lib/utils";
import {
  IconAction,
  SectionHeader,
  TabBody,
  rqTable,
} from "@/core/components/requerimientos/rq-ui";

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
    formState: { errors },
    getValues,
    watch,
  } = useFormContext<UpdateBaseRQSchemaType>();

  // El cliente no se cambia desde el detalle: se muestra en la cabecera del
  // modal y aquí solo da nombre a la lista de contactos.
  const idCliente = watch("idCliente");
  const clientName = clients.find((c) => c.idCliente === idCliente)?.razonSocial;

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
      <TabBody>
        <section className="flex flex-col gap-4">
          <SectionHeader
            title={clientName ? `Contactos de ${clientName}` : "Contactos del cliente"}
            helper="Contactos asignados a este requerimiento."
            actions={
              <Button
                variant="outline-blue"
                onClick={handleAddContact}
                disabled={!idCliente}
                className="font-medium"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Añadir contacto
              </Button>
            }
          />
          {errors.idCliente && (
            <p className="text-[13px] text-red-500 dark:text-red-400">
              {errors.idCliente.message}
            </p>
          )}

          <div className={rqTable.wrapper}>
            <div className="overflow-x-auto">
              <Table className={cn(rqTable.table, "min-w-[48rem]")}>
                <TableHeader>
                  <TableRow className={rqTable.headRow}>
                    <TableHead scope="col" className={rqTable.head}>
                      Nombre
                    </TableHead>
                    <TableHead scope="col" className={rqTable.head}>
                      Cargo
                    </TableHead>
                    <TableHead scope="col" className={rqTable.head}>
                      Celular
                    </TableHead>
                    <TableHead scope="col" className={rqTable.head}>
                      Correo
                    </TableHead>
                    <TableHead scope="col" className={cn(rqTable.head, "w-36")}>
                      Asignación
                    </TableHead>
                    <TableHead scope="col" className={cn(rqTable.head, "w-16")}>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(contacts || []).length <= 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className={rqTable.empty}>
                        No hay contactos disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => {
                      const nombre = [
                        contact.nombre,
                        contact.apellidoPaterno,
                        contact.apellidoMaterno,
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <TableRow
                          key={contact.idClienteContacto}
                          className={rqTable.row}
                        >
                          <TableCell className={cn(rqTable.cell, "font-medium")}>
                            {nombre}
                          </TableCell>
                          <TableCell className={rqTable.cell}>{contact.cargo}</TableCell>
                          <TableCell className={cn(rqTable.cell, "tabular-nums")}>
                            {contact.telefono}
                          </TableCell>
                          <TableCell className={rqTable.cell}>{contact.correo}</TableCell>
                          <TableCell className={rqTable.cell}>
                            {contact.asignado === 1 ? (
                              <Badge variant="green">Asignado</Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-transparent bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
                              >
                                No asignado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className={cn(rqTable.cell, "py-2")}>
                            <IconAction
                              icon={Pencil}
                              label={`Editar a ${nombre}`}
                              onClick={() => handleEditContact(contact)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      </TabBody>
    </>
  );
};
