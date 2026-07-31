import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  TabStopType,
  TextRun,
  TextWrappingType,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
} from "docx";
import { saveAs } from "file-saver";
import { Experience } from "../models";
import { TalentForFractalCV } from "../models/interfaces/TalentDataForFractal";
import {
  formatDateByLang,
  formatDateByLangOnlyYear,
} from "./language.utils";

/**
 * Generador del CV Fractal en formato Word (.docx) EDITABLE.
 *
 * Es el equivalente en Word de `FractalCVTemplate` (react-pdf). Se usa solo para
 * el botón "Descargar para editar": produce un .docx que el usuario puede editar
 * en Word para agregar información extra; luego ese .docx se re-sube y el backend
 * lo convierte a PDF. El banner Fractal se inserta como imagen al inicio del
 * cuerpo (delante del texto) y el crédito/fecha como párrafo al final.
 */

// Página A4 y márgenes (en twips). El tab derecho para las fechas se calcula a
// partir del ancho de contenido.
const PAGE_WIDTH = 11906;
const MARGIN_X = 720; // 0.5"
const RIGHT_TAB = PAGE_WIDTH - MARGIN_X * 2;

// Dimensiones reales del banner (public/assets/header-fr.png): 1649 x 237.
const HEADER_RATIO = 237 / 1649;
// El banner ocupa TODO el ancho de la página (no solo el área de contenido).
const HEADER_IMG_PX = Math.round(PAGE_WIDTH / 15); // ancho de página en px (~794)
const HEADER_IMG_H = Math.round(HEADER_IMG_PX * HEADER_RATIO);

const t = (language: "ES" | "EN", es: string, en: string) =>
  language === "ES" ? es : en;

/** Carga el banner Fractal desde /public. Devuelve null si falla. */
const loadHeaderImage = async (): Promise<Uint8Array | null> => {
  try {
    const base = process.env.PUBLIC_URL || "";
    const resp = await fetch(`${base}/assets/header-fr.png`);
    if (!resp.ok) return null;
    return new Uint8Array(await resp.arrayBuffer());
  } catch {
    return null;
  }
};

/**
 * Banner Fractal como imagen a ancho completo de página, anclada al borde
 * superior (flotante relativa a la página), con el texto fluyendo debajo.
 */
const buildBannerParagraph = (image: Uint8Array): Paragraph =>
  new Paragraph({
    // Sin espaciado para que el párrafo no aporte alto por encima del banner.
    spacing: { before: 0, after: 0, line: 0, lineRule: "exact" },
    children: [
      new ImageRun({
        type: "png",
        data: image,
        transformation: { width: HEADER_IMG_PX, height: HEADER_IMG_H },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            align: HorizontalPositionAlign.CENTER,
          },
          // Anclado al borde superior de la página (sin espacio en blanco arriba).
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            align: VerticalPositionAlign.TOP,
          },
          wrap: { type: TextWrappingType.TOP_AND_BOTTOM },
          allowOverlap: false,
        },
      }),
    ],
  });

/**
 * Encabezado de página real (se repite en CADA página): el banner Fractal a
 * ancho completo, anclado al borde superior. Se coloca a color pleno (sin
 * degradado ni marca de agua).
 */
const buildHeader = (image: Uint8Array): Header =>
  new Header({ children: [buildBannerParagraph(image)] });

/**
 * Pie de página real (aparece al fondo de CADA página): crédito y fecha de
 * generación, igual que el pie del PDF.
 */
const buildFooter = (language: "ES" | "EN"): Footer => {
  const date = new Intl.DateTimeFormat(
    language === "ES" ? "es-ES" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  ).format(new Date());
  const text =
    t(language, "Generado con BDT © 2025", "Generated with BDT © 2025") +
    "        |        " +
    t(language, "Fecha de generación:", "Generated on:") +
    ` ${date}`;

  return new Footer({
    children: [
      // Dos saltos de línea antes del crédito para separarlo del contenido.
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { type: ShadingType.CLEAR, fill: "F3F4F6", color: "auto" },
        children: [new TextRun({ text, size: 16, color: "666666" })],
      }),
    ],
  });
};

/** Título de sección numerado, en negrita. */
const sectionHeading = (num: number, title: string): Paragraph =>
  new Paragraph({
    spacing: { before: 220, after: 90 },
    children: [
      new TextRun({ text: `${num}. ${title}`, bold: true, size: 24 }),
    ],
  });

/** Línea "izquierda ... derecha" (p. ej. puesto/carrera a la izq. y fecha a la der.). */
const twoColLine = (
  left: string,
  right: string,
  opts?: { bold?: boolean },
): Paragraph =>
  new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    children: [
      new TextRun({ text: left, bold: opts?.bold }),
      new TextRun({ text: `\t${right}`, bold: opts?.bold }),
    ],
  });

const bulletLine = (text: string): Paragraph =>
  new Paragraph({
    text,
    bullet: { level: 0 },
    // Interlineado compacto para que cada viñeta no ocupe más de una línea.
    spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
    contextualSpacing: true,
  });

export const buildFractalCVDocx = async (
  talent: TalentForFractalCV,
  fullname: string,
  experiences: Experience[],
  language: "ES" | "EN",
): Promise<Blob> => {
  const headerImage = await loadHeaderImage();
  const children: Paragraph[] = [];

  // El banner Fractal va como encabezado de página real (ver `headers` abajo).

  // Nombre.
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: fullname, bold: true, size: 32 })],
    }),
  );

  // Descripción.
  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text:
            talent.descripcion?.replace(/(?<!\.)\n+/g, " ").trim() ||
            t(language, "Sin descripción disponible.", "No description available."),
        }),
      ],
    }),
  );

  let section = 1;

  // Experiencia laboral.
  if (experiences && experiences.length > 0) {
    children.push(
      sectionHeading(section++, t(language, "Experiencia laboral", "Work Experience")),
    );
    experiences.forEach((exp) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: exp.nombreEmpresa, bold: true })] }),
      );
      const dateRange = `${formatDateByLang(exp.fechaInicio, language)} - ${
        exp.flActualidad
          ? t(language, "Actualidad", "Present")
          : formatDateByLang(exp.fechaFin, language)
      }`;
      children.push(twoColLine(exp.puesto, dateRange, { bold: true }));
      if (exp.funciones) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [new TextRun({ text: exp.funciones })],
          }),
        );
      }
    });
  }

  // Educación.
  if (talent.educaciones && talent.educaciones.length > 0) {
    children.push(sectionHeading(section++, t(language, "Educación", "Education")));
    talent.educaciones.forEach((ed) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: ed.nombreInstitucion, bold: true })] }),
      );
      const start =
        ed.tipoFechaEducaciones === 2
          ? formatDateByLang(ed.fechaInicio, language)
          : formatDateByLangOnlyYear(ed.fechaInicio, language);
      const end = ed.flActualidad
        ? t(language, "Actualidad", "Present")
        : ed.tipoFechaEducaciones === 2
          ? formatDateByLang(ed.fechaFin, language)
          : formatDateByLangOnlyYear(ed.fechaFin, language);
      children.push(twoColLine(`${ed.carrera} - ${ed.grado}`, `${start} - ${end}`));
    });
  }

  // Certificaciones.
  if (talent.certificaciones && talent.certificaciones.length > 0) {
    children.push(
      sectionHeading(section++, t(language, "Certificaciones", "Certifications")),
    );
    talent.certificaciones.forEach((c) => {
      children.push(
        new Paragraph({ children: [new TextRun({ text: c.nombreInstitucion, bold: true })] }),
      );
      children.push(
        twoColLine(
          c.carrera,
          `${formatDateByLang(c.fechaInicio, language)} - ${formatDateByLang(c.fechaFin, language)}`,
        ),
      );
    });
  }

  // Habilidades técnicas.
  if (talent.habilidadesTecnicas && talent.habilidadesTecnicas.length > 0) {
    children.push(
      sectionHeading(section++, t(language, "Habilidades Técnicas", "Technical Skills")),
    );
    talent.habilidadesTecnicas.forEach((c) => {
      const suffix =
        c.aniosExperiencia === 0
          ? ""
          : ` - ${c.aniosExperiencia} ${t(language, "años", "years")}`;
      children.push(bulletLine(`${c.nombreHabilidad}${suffix}`));
    });
  }

  // Habilidades blandas.
  if (talent.habilidadesBlandas && talent.habilidadesBlandas.length > 0) {
    children.push(
      sectionHeading(section++, t(language, "Habilidades Blandas", "Soft Skills")),
    );
    talent.habilidadesBlandas.forEach((s) => children.push(bulletLine(s.nombreHabilidad)));
  }

  // Idiomas.
  if (talent.idiomas && talent.idiomas.length > 0) {
    children.push(sectionHeading(section++, t(language, "Idiomas", "Languages")));
    talent.idiomas.forEach((lan) =>
      children.push(bulletLine(`${lan.nombreIdioma} - ${lan.nivelIdioma}`)),
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            // Margen superior amplio para que el texto empiece debajo del banner
            // del encabezado (anclado al borde superior de la página).
            margin: {
              top: headerImage ? HEADER_IMG_H * 15 + 240 : 720,
              bottom: 720,
              left: MARGIN_X,
              right: MARGIN_X,
              // El encabezado arranca en el borde superior (el banner va pegado).
              header: 0,
            },
          },
        },
        // Encabezado de página real con el banner Fractal (si se pudo cargar).
        ...(headerImage ? { headers: { default: buildHeader(headerImage) } } : {}),
        // Pie de página real: se ancla al fondo de cada página.
        footers: { default: buildFooter(language) },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
};

/** MIME oficial de un documento Word .docx (OOXML). */
export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Genera el CV Fractal como un `File` .docx listo para subir a S3. El nombre y el
 * contenido son idénticos al de "Descargar para editar".
 */
export const buildFractalCVDocxFile = async (
  talent: TalentForFractalCV,
  fullname: string,
  experiences: Experience[],
  language: "ES" | "EN",
): Promise<File> => {
  const blob = await buildFractalCVDocx(talent, fullname, experiences, language);
  const safeName = fullname.trim().replace(/\s+/g, "_") || "CV";
  return new File([blob], `${safeName}_CV_${language}.docx`, { type: DOCX_MIME });
};

/** Genera el .docx y dispara la descarga en el navegador. */
export const downloadFractalCVDocx = async (
  talent: TalentForFractalCV,
  fullname: string,
  experiences: Experience[],
  language: "ES" | "EN",
): Promise<void> => {
  const blob = await buildFractalCVDocx(talent, fullname, experiences, language);
  const safeName = fullname.trim().replace(/\s+/g, "_") || "CV";
  saveAs(blob, `${safeName}_CV_${language}.docx`);
};
