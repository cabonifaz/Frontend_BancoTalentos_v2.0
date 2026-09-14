import { Pencil, Plus } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "@/core/models/schemas/NewRQSchemaV1";
import { Client } from "@/core/models/interfaces/Client";
import { useFetchClientContacts } from "@/core/hooks/useFetchClientContacts";
import { useEffect, useState } from "react";
import { Loading } from "@/core/components/ui/Loading";
import { ReqContacto } from "@/core/models/interfaces/ReqContacto";
import { ModalRQContactV2 } from "@/core/components/requerimientos/modals/ModalContactV2";
import { Button } from "@/core/components/ui/shadcn/button";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/shadcn/table";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { cn } from "@/core/lib/utils";
import {
  Field,
  GroupDivider,
  IconAction,
  SectionHeader,
  TabBody,
  rqControl,
  rqTable,
} from "@/core/components/requerimientos/rq-ui";

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
    control,
    formState: { errors },
    clearErrors,
    setValue,
    getValues,
    watch,
  } = useFormContext<newRQSchemaType>();

  const idCliente = watch("idCliente");

  // Sincronizar la lista de contactos con el Schema
  useEffect(() => {
    setValue("lstContactos", selContacts, { shouldValidate: true });
  }, [selContacts, setValue]);

  const handleClienteChange = (selectedClienteId: number) => {
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
      <TabBody>
          <Field
            label="Cliente"
            htmlFor="rq-create-cliente"
            required
            error={errors.idCliente?.message}
            className="md:w-1/2"
          >
            <Controller
              name="idCliente"
              control={control}
              render={({ field }) => (
                // La opción "Elija un cliente" era disabled: no se puede volver
                // a ella, así que no hay opción vacía.
                <AppSelect
                  ref={field.ref}
                  id="rq-create-cliente"
                  name={field.name}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={(v) => handleClienteChange(Number(v))}
                  options={clients.map((c) => ({
                    value: c.idCliente,
                    label: c.razonSocial,
                  }))}
                  placeholder="Elija un cliente"
                  emptyOption={false}
                  aria-invalid={!!errors.idCliente}
                  className={rqControl}
                />
              )}
            />
          </Field>

        <GroupDivider />

        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Contactos del cliente"
            helper="Marca los contactos asignados a este requerimiento."
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

          <div className={rqTable.wrapper}>
            <div className="overflow-x-auto">
              <Table className={cn(rqTable.table, "min-w-[48rem]")}>
                <TableHeader>
                  <TableRow className={rqTable.headRow}>
                    <TableHead scope="col" className={cn(rqTable.head, "w-24 text-center")}>
                      Asignar
                    </TableHead>
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
                    <TableHead scope="col" className={cn(rqTable.head, "w-16")}>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length <= 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className={rqTable.empty}>
                        {idCliente
                          ? "Este cliente aún no tiene contactos."
                          : "Elige un cliente para ver sus contactos."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((c) => {
                      const nombre = [c.nombre, c.apellidoPaterno, c.apellidoMaterno]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <TableRow key={c.idClienteContacto} className={rqTable.row}>
                          <TableCell className={rqTable.cell}>
                            <div className="flex justify-center">
                              <Checkbox
                                id={`contact-${c.idClienteContacto}`}
                                aria-label={`Asignar a ${nombre}`}
                                checked={selContacts.includes(c.idClienteContacto)}
                                onCheckedChange={() =>
                                  handleContactToggle(c.idClienteContacto)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className={cn(rqTable.cell, "font-medium")}>
                            {nombre}
                          </TableCell>
                          <TableCell className={rqTable.cell}>{c.cargo}</TableCell>
                          <TableCell className={cn(rqTable.cell, "tabular-nums")}>
                            {c.telefono}
                          </TableCell>
                          <TableCell className={rqTable.cell}>{c.correo}</TableCell>
                          <TableCell className={cn(rqTable.cell, "py-2")}>
                            <IconAction
                              icon={Pencil}
                              label={`Editar a ${nombre}`}
                              onClick={() => handleEditContact(c)}
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
