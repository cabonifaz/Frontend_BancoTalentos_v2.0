import { useEffect, useRef } from "react";
import { Star } from "lucide-react";
import {
  FieldValues,
  Controller,
  useFieldArray,
  ArrayPath,
  Path,
} from "react-hook-form";
import { DynamicSectionProps, Param } from "@/core/models";
import { DynamicSection } from "./DynamicSection";
import { AppSelect } from "@/core/components/ui/AppSelect";

const selectClass = "h-12 border-gray-300 p-3 dark:border-slate-600";

interface LanguagesSectionProps<F extends FieldValues>
  extends DynamicSectionProps<F> {
  idiomas: Param[];
  nivelesIdioma: Param[];
}

export const LanguagesSection = <F extends FieldValues>({
  control,
  errors,
  idiomas,
  nivelesIdioma,
  shouldShowEmptyForm = true,
  shouldAddElements = true,
  itemVariant = "plain",
}: LanguagesSectionProps<F>) => {
  const { fields, append, remove } = useFieldArray<F, ArrayPath<F>>({
    control,
    name: "idiomas" as ArrayPath<F>,
  });

  const hasAppendedInitial = useRef(false);

  useEffect(() => {
    if (
      shouldShowEmptyForm &&
      fields.length === 0 &&
      !hasAppendedInitial.current
    ) {
      append({
        idIdioma: 0,
        idNivel: 0,
        estrellas: 0,
      } as any);
      hasAppendedInitial.current = true;
    }
  }, [shouldShowEmptyForm, fields.length, append]);

  return (
    <DynamicSection
      title="Idiomas"
      onAdd={() =>
        append({
          idIdioma: 0,
          idNivel: 0,
          estrellas: 0,
        } as any)
      }
      onRemove={remove}
      canRemoveFirst={!shouldShowEmptyForm}
      canAddSections={shouldAddElements}
      itemVariant={itemVariant}
    >
      {fields.map((field, index) => (
        <div key={field.id}>
          {/* Idioma */}
          <div className="flex flex-col my-2">
            <label
              htmlFor={`idiomas.${index}.idIdioma`}
              className="text-[#71717A] text-sm px-1 dark:text-slate-400"
            >
              Idioma<span className="text-red-400">*</span>
            </label>
            <Controller
              name={`idiomas.${index}.idIdioma` as Path<F>}
              control={control}
              render={({ field: controllerField }) => (
                <AppSelect
                  ref={controllerField.ref}
                  id={`idiomas.${index}.idIdioma`}
                  name={controllerField.name}
                  onBlur={controllerField.onBlur}
                  value={controllerField.value ?? 0}
                  onChange={(v) =>
                    controllerField.onChange(v === "" ? 0 : Number(v))
                  }
                  options={idiomas.map((idioma) => ({
                    value: idioma.num1,
                    label: idioma.string1,
                  }))}
                  placeholder="Seleccione un idioma"
                  className={selectClass}
                />
              )}
            />
            {(errors as any)?.idiomas?.[index]?.idIdioma && (
              <p className="text-red-400 text-sm">
                {(errors as any).idiomas[index]?.idIdioma?.message as string}
              </p>
            )}
          </div>

          {/* Nivel */}
          <div className="flex flex-col my-2">
            <label
              htmlFor={`idiomas.${index}.idNivel`}
              className="text-[#71717A] text-sm px-1 dark:text-slate-400"
            >
              Nivel<span className="text-red-400">*</span>
            </label>
            <Controller
              name={`idiomas.${index}.idNivel` as Path<F>}
              control={control}
              render={({ field: controllerField }) => (
                <AppSelect
                  ref={controllerField.ref}
                  id={`idiomas.${index}.idNivel`}
                  name={controllerField.name}
                  onBlur={controllerField.onBlur}
                  value={controllerField.value ?? 0}
                  onChange={(v) =>
                    controllerField.onChange(v === "" ? 0 : Number(v))
                  }
                  options={nivelesIdioma.map((nivel) => ({
                    value: nivel.num1,
                    label: nivel.string1,
                  }))}
                  placeholder="Seleccione un nivel"
                  className={selectClass}
                />
              )}
            />
            {(errors as any)?.idiomas?.[index]?.idNivel && (
              <p className="text-red-400 text-sm">
                {(errors as any).idiomas[index]?.idNivel?.message as string}
              </p>
            )}
          </div>

          {/* Estrellas */}
          <div className="flex flex-col my-2">
            <label className="text-[#71717A] text-sm px-1 mb-2 dark:text-slate-400">
              Nivel de dominio<span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <Controller
                name={`idiomas.${index}.estrellas` as Path<F>}
                control={control}
                render={({ field: controllerField }) => (
                  <>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className="star cursor-pointer"
                        onClick={() => controllerField.onChange(star)}
                      >
                        <Star
                          aria-label={`Star ${star}`}
                          className={`star-icon w-6 h-6 ${
                            (controllerField.value ?? 0) >= star
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300 dark:text-slate-600"
                          }`}
                        />
                      </div>
                    ))}
                  </>
                )}
              />
            </div>
            {(errors as any)?.idiomas?.[index]?.estrellas && (
              <p className="text-red-400 text-sm mt-2">
                {(errors as any).idiomas[index]?.estrellas?.message as string}
              </p>
            )}
          </div>
        </div>
      ))}
    </DynamicSection>
  );
};
