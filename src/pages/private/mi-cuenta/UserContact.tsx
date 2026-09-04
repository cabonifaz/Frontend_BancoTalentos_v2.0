import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { enqueueSnackbar } from "notistack";
import { Dashboard } from "../Dashboard";
import { Loading } from "../../../core/components/ui/Loading";
import { useApi } from "../../../core/hooks/useApi";
import {
  BaseResponse,
  UpdateUserParams,
  UserInfoResponse,
} from "../../../core/models";
import { getUserInfo, updateUserInfo } from "../../../core/services/account.service";
import {
  handleError,
  handleResponse,
} from "../../../core/utilities/errorHandler";

const schema = z.object({
  telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(/^\d+$/, "Solo se permiten caracteres numéricos")
    .length(9, "El teléfono debe tener exactamente 9 dígitos")
    .refine((v) => v.startsWith("9"), {
      message: "El teléfono debe comenzar con el dígito 9",
    }),
});

type UserContactForm = z.infer<typeof schema>;

const ReadonlyField = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="input-label">{label}</span>
    <p
      className="input bg-gray-50 text-gray-600 cursor-default min-h-[48px] flex items-center break-all min-w-0 dark:bg-slate-800 dark:text-slate-300"
      title={value || undefined}
    >
      {value || <span className="text-gray-300 dark:text-slate-600">—</span>}
    </p>
  </div>
);

export const UserContact = () => {
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UserContactForm>({
    resolver: zodResolver(schema),
    defaultValues: { telefono: "" },
    mode: "onChange",
  });

  const { loading: fetchLoading, fetch: fetchUserInfo } = useApi<
    UserInfoResponse,
    null
  >(getUserInfo, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) => {
      const info = response.data;
      setUserInfo(info);
      reset({ telefono: info.telefono || "" });
    },
  });

  const { loading: updateLoading, fetch: doUpdate } = useApi<
    BaseResponse,
    UpdateUserParams
  >(updateUserInfo, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response,
        showSuccessMessage: true,
        enqueueSnackbar,
      }),
  });

  useEffect(() => {
    fetchUserInfo(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (data: UserContactForm) => {
    doUpdate({ telefono: data.telefono }).then((response) => {
      if (response.data.idMensaje === 2) {
        reset({ telefono: data.telefono });
      }
    });
  };

  const initial =
    userInfo?.nombres?.charAt(0).toUpperCase() ||
    userInfo?.usuario?.charAt(0).toUpperCase() ||
    "";

  const fullName =
    userInfo
      ? `${userInfo.nombres} ${userInfo.apellidos}`.trim()
      : null;

  return (
    <Dashboard>
      {(fetchLoading || updateLoading) && (
        <Loading opacity="opacity-60" />
      )}

      <div className="h-full overflow-y-auto">
        <div className="w-full max-w-2xl mx-auto">

          <h1 className="text-2xl font-semibold text-gray-800 mb-6 dark:text-slate-100">
            Mi cuenta
          </h1>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">

            {/* ── Profile header ─────────────────────────────────────── */}
            <div className="bg-[#009688] px-6 py-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 select-none">
                {initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-semibold text-lg leading-tight truncate">
                  {fullName || "—"}
                </h2>
                {userInfo?.usuario && (
                  <p className="text-white/70 text-sm truncate">
                    @{userInfo.usuario}
                  </p>
                )}
              </div>
            </div>

            {/* ── Read-only account info ──────────────────────────────── */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 dark:text-slate-500">
                Información de cuenta
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadonlyField label="Usuario" value={userInfo?.usuario} />
                <ReadonlyField label="Nombres" value={userInfo?.nombres} />
                <ReadonlyField label="Apellidos" value={userInfo?.apellidos} />
                <ReadonlyField label="Email" value={userInfo?.email} />
              </div>
            </div>

            <div className="border-t border-gray-100 mx-6 dark:border-slate-700" />

            {/* ── Editable contact section ────────────────────────────── */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 dark:text-slate-500">
                Datos de contacto
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="max-w-sm">
                  <label className="input-label block mb-1">
                    Teléfono{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <Controller
                    name="telefono"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="tel"
                        inputMode="numeric"
                        maxLength={9}
                        placeholder="Ej. 987654321"
                        className="input w-full"
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 9);
                          field.onChange(onlyDigits);
                        }}
                      />
                    )}
                  />
                  {errors.telefono && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.telefono.message}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={!isDirty || updateLoading}
                    className={`btn ${
                      isDirty && !updateLoading
                        ? "btn-primary"
                        : "btn-disabled"
                    }`}
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </Dashboard>
  );
};
