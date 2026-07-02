import { useEffect, useRef } from "react";
import {
  FieldValues,
  Controller,
  useFieldArray,
  ArrayPath,
  Path,
} from "react-hook-form";
import { DynamicSectionProps, Param } from "../../models";
import { DynamicSection } from "./DynamicSection";

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
    >
      {fields.map((field, index) => (
        <div key={field.id}>
          {/* Idioma */}
          <div className="flex flex-col my-2">
            <label
              htmlFor={`idiomas.${index}.idIdioma`}
              className="text-[#71717A] text-sm px-1"
            >
              Idioma<span className="text-red-400">*</span>
            </label>
            <Controller
              name={`idiomas.${index}.idIdioma` as Path<F>}
              control={control}
              render={({ field: controllerField }) => (
                <select
                  {...controllerField}
                  id={`idiomas.${index}.idIdioma`}
                  value={controllerField.value ?? 0}
                  onChange={(e) =>
                    controllerField.onChange(Number(e.target.value))
                  }
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value={0}>Seleccione un idioma</option>
                  {idiomas.map((idioma) => (
                    <option key={idioma.idParametro} value={idioma.num1}>
                      {idioma.string1}
                    </option>
                  ))}
                </select>
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
              className="text-[#71717A] text-sm px-1"
            >
              Nivel<span className="text-red-400">*</span>
            </label>
            <Controller
              name={`idiomas.${index}.idNivel` as Path<F>}
              control={control}
              render={({ field: controllerField }) => (
                <select
                  {...controllerField}
                  id={`idiomas.${index}.idNivel`}
                  value={controllerField.value ?? 0}
                  onChange={(e) =>
                    controllerField.onChange(Number(e.target.value))
                  }
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value={0}>Seleccione un nivel</option>
                  {nivelesIdioma.map((nivel) => (
                    <option key={nivel.idParametro} value={nivel.num1}>
                      {nivel.string1}
                    </option>
                  ))}
                </select>
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
            <label className="text-[#71717A] text-sm px-1 mb-2">
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
                        <img
                          src={
                            (controllerField.value ?? 0) >= star
                              ? "/assets/ic_fill_star.svg"
                              : "/assets/ic_outline_star.svg"
                          }
                          alt={`Star ${star}`}
                          className="star-icon w-6 h-6"
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
