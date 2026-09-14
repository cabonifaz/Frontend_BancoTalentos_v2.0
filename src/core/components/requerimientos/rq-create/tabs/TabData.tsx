import { Controller, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "@/core/models/schemas/NewRQSchemaV1";
import { useEffect, useState } from "react";
import { Param } from "@/core/models";
import { Input } from "@/core/components/ui/shadcn/input";
import { Textarea } from "@/core/components/ui/shadcn/textarea";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { DatePicker } from "@/core/components/ui/DatePicker";
import { cn } from "@/core/lib/utils";
import {
  Field,
  FormGroup,
  TabBody,
  rqControl,
} from "@/core/components/requerimientos/rq-ui";

interface TabProps {
  rqStates: Param[];
}

/** Límite de la descripción en el esquema (NewRQSchemaV1). */
const DESCRIPCION_MAX = 255;

export const TabData = ({ rqStates }: TabProps) => {
  // @marker base state
  const [autogenRQ, setAutogenRQ] = useState(false);

  const {
    register,
    control,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
    setError,
  } = useFormContext<newRQSchemaType>();

  const fchSol = watch("fechaSolicitud");
  const fchVenc = watch("fechaVencimiento");
  const descripcion = watch("descripcion") ?? "";

  useEffect(() => {
    if (fchSol && fchVenc) {
      const fechaSolicitudDate = new Date(fchSol);
      const fechaVencimientoDate = new Date(fchVenc);

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
  }, [fchSol, fchVenc, setError, clearErrors]);

  return (
    <TabBody className="min-h-full">
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
          <Field
            label="Título"
            htmlFor="rq-create-titulo"
            required
            error={errors.titulo?.message}
            className="md:col-span-2"
          >
            <Input
              id="rq-create-titulo"
              placeholder="Ej. Analista de datos senior"
              aria-invalid={!!errors.titulo}
              {...register("titulo")}
              className={rqControl}
            />
          </Field>

          <Field
            label="Código RQ"
            htmlFor="rq-create-codigo"
            required={!autogenRQ}
            error={errors.codigoRQ?.message}
            aside={
              // Igual que el checkbox anterior (cuyo onChange pisaba al de
              // register), solo gobierna el código: autogenRQ se queda con el
              // false de defaultValues y el payload no cambia.
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                <Checkbox
                  id="rq-create-autogen"
                  checked={autogenRQ}
                  onCheckedChange={(value) => {
                    const checked = value === true;
                    setAutogenRQ(checked);
                    setValue("codigoRQ", checked ? "Autogenerado" : "");
                    clearErrors("codigoRQ");
                  }}
                />
                Autogenerar
              </label>
            }
          >
            <Input
              id="rq-create-codigo"
              placeholder="RQ-0000"
              aria-invalid={!!errors.codigoRQ}
              {...register("codigoRQ")}
              disabled={autogenRQ}
              className={cn(
                rqControl,
                autogenRQ && "text-zinc-500 dark:text-slate-400"
              )}
            />
          </Field>
          <Field
            label="Estado"
            htmlFor="rq-create-estado"
            required
            error={errors.idEstado?.message}
          >
            <Controller
              name="idEstado"
              control={control}
              render={({ field }) => (
                // valueAsNumber del <select> anterior: la opción vacía era 0.
                <AppSelect
                  ref={field.ref}
                  id="rq-create-estado"
                  name={field.name}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={(v) => field.onChange(v === "" ? 0 : Number(v))}
                  options={rqStates.map((option) => ({
                    value: option.num1,
                    label: option.string1,
                  }))}
                  placeholder="Seleccione un estado"
                  aria-invalid={!!errors.idEstado}
                  className={rqControl}
                />
              )}
            />
          </Field>

          <Field
            label="Fecha de solicitud"
            htmlFor="rq-create-fecha-solicitud"
            required
            error={errors.fechaSolicitud?.message}
          >
            <Controller
              name="fechaSolicitud"
              control={control}
              render={({ field }) => (
                <DatePicker
                  ref={field.ref}
                  id="rq-create-fecha-solicitud"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.fechaSolicitud}
                  className={rqControl}
                />
              )}
            />
          </Field>

          <Field
            label="Fecha de vencimiento"
            htmlFor="rq-create-fecha-vencimiento"
            required
            error={errors.fechaVencimiento?.message}
          >
            <Controller
              name="fechaVencimiento"
              control={control}
              render={({ field }) => (
                <DatePicker
                  ref={field.ref}
                  id="rq-create-fecha-vencimiento"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.fechaVencimiento}
                  className={rqControl}
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
            Descripción<span className="text-red-500"> *</span>
          </>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <Textarea
            id="rq-create-descripcion"
            aria-label="Descripción"
            aria-invalid={!!errors.descripcion}
            placeholder="Describe el perfil que se busca y el contexto del requerimiento"
            maxLength={DESCRIPCION_MAX}
            {...register("descripcion")}
            className="min-h-[7rem] flex-1 resize-none"
          />
          <div className="flex justify-between gap-4 text-[13px]">
            <span className="text-red-500 dark:text-red-400">
              {errors.descripcion?.message}
            </span>
            <span className="tabular-nums text-gray-500 dark:text-slate-400">
              {descripcion.length}/{DESCRIPCION_MAX}
            </span>
          </div>
        </div>
      </FormGroup>
    </TabBody>
  );
};
