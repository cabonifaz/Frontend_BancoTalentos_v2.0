import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { ArrowRight, PhoneCall, Plus, X } from "lucide-react";
import { useParams } from "../../context/ParamsContext";
import { TIPO_ENTREVISTA } from "../../utilities/constants";
import { isTelefonicaType } from "../../utilities/interviewType";
import {
  InterviewByTalent,
  listInterviewsByTalent,
} from "../../services/interviews.service";

interface Props {
  idTalento?: number;
  /** Nombre completo, para dejarlo escrito en el buscador de Crear entrevista. */
  nombreCompleto: string;
}

/** Fecha de hoy en el formato de los inputs date. */
const hoyISO = (): string => {
  const hoy = new Date();
  const mes = `${hoy.getMonth() + 1}`.padStart(2, "0");
  const dia = `${hoy.getDate()}`.padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-${dia}`;
};

/**
 * Hora actual redondeada hacia arriba al siguiente cuarto de hora: nadie agenda
 * una entrevista a las 18:07.
 */
const horaSugerida = (): string => {
  const ahora = new Date();
  ahora.setSeconds(0, 0);
  ahora.setMinutes(Math.ceil(ahora.getMinutes() / 15) * 15);
  return `${`${ahora.getHours()}`.padStart(2, "0")}:${`${ahora.getMinutes()}`.padStart(2, "0")}`;
};

/**
 * Atajo del detalle del talento: agenda una entrevista telefónica sin pasar por
 * un requerimiento.
 *
 * Si el talento ya tuvo telefónicas, antes de crear otra se ofrece abrir la
 * última: evita duplicar una entrevista que quizá sólo hay que completar.
 */
export const BotonEntrevistaTelefonica = ({
  idTalento,
  nombreCompleto,
}: Props) => {
  const navigate = useNavigate();
  const { paramsByMaestro } = useParams();

  const [cargando, setCargando] = useState(false);
  const [previas, setPrevias] = useState<InterviewByTalent[] | null>(null);

  const tipoTelefonica = (paramsByMaestro[TIPO_ENTREVISTA] || []).find((tipo) =>
    isTelefonicaType(tipo.string1),
  );

  const modalRoot = document.getElementById("modal");

  const irACrear = () => {
    setPrevias(null);
    navigate("/dashboard/entrevistas/nueva", {
      state: {
        idTalento,
        talentName: nombreCompleto,
        // El tipo se manda con la etiqueta exacta del maestro para que el
        // formulario lo marque sin depender de tildes ni mayúsculas.
        tipoEntrevista: tipoTelefonica?.string1,
        fecha: hoyISO(),
        hora: horaSugerida(),
      },
    });
  };

  const handleClick = async () => {
    if (!idTalento) return;

    if (!tipoTelefonica) {
      // Sin el parámetro no se puede marcar el tipo en el formulario.
      enqueueSnackbar(
        "No está configurado el tipo de entrevista telefónica (maestro 47).",
        { variant: "warning" },
      );
      return;
    }

    setCargando(true);
    try {
      const { data } = await listInterviewsByTalent(
        idTalento,
        tipoTelefonica.num1,
      );
      const entrevistas = data?.data ?? [];

      if (entrevistas.length === 0) {
        irACrear();
        return;
      }

      setPrevias(entrevistas);
    } catch (error) {
      enqueueSnackbar("No se pudieron consultar las entrevistas del talento", {
        variant: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const ultima = previas?.[0];

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!idTalento || cargando}
        title="Agendar una entrevista telefónica"
        className="flex items-center justify-center gap-2 rounded-lg bg-[#0b85c3] px-3 py-2 text-sm leading-tight text-white hover:bg-[#0B6E99] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PhoneCall className="h-4 w-4 shrink-0" />
        Ent. telefónica
      </button>

      {previas && modalRoot &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#00000048] p-4 dark:bg-black/70">
            <div className="w-full rounded-lg bg-white p-6 dark:bg-slate-800 md:w-[460px]">
              <div className="mb-1 flex items-start justify-between gap-4">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-slate-100">
                    <PhoneCall size={18} strokeWidth={1.8} className="text-[#0b85c3]" />
                    Entrevista telefónica
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    {nombreCompleto} ya tiene{" "}
                    {previas.length === 1
                      ? "una entrevista telefónica"
                      : `${previas.length} entrevistas telefónicas`}
                    .
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrevias(null)}
                  aria-label="Cerrar"
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={irACrear}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-[#0b85c3] hover:bg-sky-50 dark:border-slate-600 dark:hover:border-sky-400 dark:hover:bg-sky-400/10"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-300">
                    <Plus size={18} strokeWidth={1.8} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                      Registrar nueva entrevista telefónica
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      Con el talento, la fecha y la hora ya cargados
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/entrevistas/${ultima?.idEntrevista}`)
                  }
                  disabled={!ultima?.idEntrevista}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-[#0b85c3] hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:hover:border-sky-400 dark:hover:bg-sky-400/10"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-300">
                    <ArrowRight size={18} strokeWidth={1.8} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                      Ir a la última entrevista telefónica
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {[ultima?.fecha, ultima?.hora].filter(Boolean).join(" · ") ||
                        "Abrir su detalle"}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>,
          modalRoot,
        )}
    </>
  );
};
