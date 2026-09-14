import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { UpdateBaseRQSchemaType } from "@/core/models/schemas/UpdateBaseRQSchema";
import { Param } from "@/core/models";
import { Input } from "@/core/components/ui/shadcn/input";
import { Textarea } from "@/core/components/ui/shadcn/textarea";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { DatePicker } from "@/core/components/ui/DatePicker";
import { cn } from "@/core/lib/utils";
import {
  Field,
  FormGroup,
  TabBody,
  rqControl,
  rqReadonly,
} from "@/core/components/requerimientos/rq-ui";

interface TabProps {
  rqStates: Param[];
  isEditing: boolean;
}

/** Límite de la descripción en el esquema (UpdateBaseRQSchema). */
const DESCRIPCION_MAX = 255;

/** Campo de 48 px que, sin editar, se ve bloqueado pero legible. */
const fieldClass = cn(rqControl, rqReadonly);

export const TabRQData = ({ rqStates, isEditing }: TabProps) => {
  const {
    register,
    control,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useFormContext<UpdateBaseRQSchemaType>();

  // Agregar watchers para las fechas
  const fchSolcitud = watch("fechaSolicitud");
  const fchVencimiento = watch("fechaVencimiento");
  const descripcion = watch("descripcion") ?? "";

  // Sin pulsar Editar los datos se ven en sus campos, pero bloqueados.
  const locked = !isEditing;

  useEffect(() => {
    if (fchSolcitud && fchVencimiento) {
      const fechaSolicitudDate = new Date(fchSolcitud);
      const fechaVencimientoDate = new Date(fchVencimiento);

      if (fechaVencimientoDate < fechaSolicitudDate) {
        requestAnimationFrame(() => {
          setError("fechaVencimiento", {
            type: "manual",
            message:
              "La fecha de vencimiento no puede ser menor a la fecha de solicitud",
          });
        });
      } else {
        requestAnimationFrame(() => {
          clearErrors("fechaVencimiento");
        });
      }
    }
  }, [fchSolcitud, fchVencimiento]);

  return (
    <TabBody className="min-h-full">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
          <Field
            label="Título"
            htmlFor="rq-edit-titulo"
            required={isEditing}
            error={errors.titulo?.message}
            className="md:col-span-2"
          >
            <Input
              id="rq-edit-titulo"
              aria-invalid={!!errors.titulo}
              {...register("titulo")}
              disabled={locked}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Código RQ"
            htmlFor="rq-edit-codigo"
            required={isEditing}
            error={errors.codigoRQ?.message}
          >
            <Input
              id="rq-edit-codigo"
              aria-invalid={!!errors.codigoRQ}
              {...register("codigoRQ")}
              disabled={locked}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Estado"
            htmlFor="rq-edit-estado"
            required={isEditing}
            error={errors.idEstadoRQ?.message}
          >
            <Controller
              name="idEstadoRQ"
              control={control}
              render={({ field }) => (
                // valueAsNumber del <select> anterior, que no tenía opción vacía.
                <AppSelect
                  ref={field.ref}
                  id="rq-edit-estado"
                  name={field.name}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={(v) => field.onChange(Number(v))}
                  options={rqStates.map((option) => ({
                    value: option?.num1,
                    label: option?.string1,
                  }))}
                  emptyOption={false}
                  disabled={locked}
                  aria-invalid={!!errors.idEstadoRQ}
                  className={fieldClass}
                />
              )}
            />
          </Field>

          <Field
            label="Fecha de solicitud"
            htmlFor="rq-edit-fecha-solicitud"
            required={isEditing}
            error={errors.fechaSolicitud?.message}
          >
            <Controller
              name="fechaSolicitud"
              control={control}
              render={({ field }) => (
                <DatePicker
                  ref={field.ref}
                  id="rq-edit-fecha-solicitud"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={locked}
                  aria-invalid={!!errors.fechaSolicitud}
                  className={fieldClass}
                />
              )}
            />
          </Field>

          <Field
            label="Fecha de vencimiento"
            htmlFor="rq-edit-fecha-vencimiento"
            required={isEditing}
            error={errors.fechaVencimiento?.message}
          >
            <Controller
              name="fechaVencimiento"
              control={control}
              render={({ field }) => (
                <DatePicker
                  ref={field.ref}
                  id="rq-edit-fecha-vencimiento"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={locked}
                  aria-invalid={!!errors.fechaVencimiento}
                  className={fieldClass}
                />
              )}
            />
          </Field>
      </div>

      {/* Descripción ocupa el alto que queda: la pestaña no deja un hueco
          vacío debajo (TabBody lleva min-h-full). */}
      <FormGroup
        className="min-h-0 flex-1"
        title={
          <>
            Descripción
            {isEditing && <span className="text-red-500"> *</span>}
          </>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <Textarea
            id="rq-edit-descripcion"
            aria-label="Descripción"
            aria-invalid={!!errors.descripcion}
            maxLength={DESCRIPCION_MAX}
            {...register("descripcion")}
            disabled={locked}
            className={cn("min-h-[7rem] flex-1 resize-none", rqReadonly)}
          />
          {isEditing && (
            <div className="flex justify-between gap-4 text-[13px]">
              <span className="text-red-500 dark:text-red-400">
                {errors.descripcion?.message}
              </span>
              <span className="tabular-nums text-gray-500 dark:text-slate-400">
                {descripcion.length}/{DESCRIPCION_MAX}
              </span>
            </div>
          )}
        </div>
      </FormGroup>
    </TabBody>
  );
};
