import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Experience } from "../../models";
import { formatDateByLang } from "../../utilities/language.utils";
import { TalentForFractalCV } from "../../models/interfaces/TalentDataForFractal";

interface FractalCVTemplateProps {
  talent?: TalentForFractalCV;
  language?: "ES" | "EN";
  fullname: string;
  sorteWorkExperience: Experience[];
}

// === Estilos del documento ===
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    color: "#111111",
    fontSize: 10,
    paddingTop: 70,
    paddingBottom: 70,
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },
  headerFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#FFFFFF",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  fullname: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 10,
    textAlign: "justify",
    marginBottom: 6,
  },
  itemContainer: {
    marginBottom: 8,
  },
  bold: { fontWeight: "bold" },
  flexBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerFixed: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#666666",
    textAlign: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  footerText: {
    fontSize: 8,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 15,
  },
});

const Header = () => (
  <View style={styles.headerFixed} fixed>
    <Image src="/assets/header-fr.png" style={styles.headerImage} />
  </View>
);

const Footer: React.FC<{ language: "ES" | "EN" }> = ({
  language,
}) => {
  const t = (es: string, en: string) => (language === "ES" ? es : en);

  return (
    <View style={styles.footerFixed} fixed>
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          {t("Generado con BDT © 2025", "Generated with BDT © 2025")}
        </Text>
        <Text style={styles.footerText}>|</Text>
        <Text style={styles.footerText}>
          {t("Fecha de generación:", "Generated on:")}{" "}
          {new Intl.DateTimeFormat(
            language === "ES" ? "es-ES" : "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          ).format(new Date())}
        </Text>
      </View>
    </View>
  );
};

export const FractalCVTemplate: React.FC<FractalCVTemplateProps> = ({
  talent,
  language = "ES",
  fullname,
  sorteWorkExperience,
}) => {
  const t = (es: string, en: string) => (language === "ES" ? es : en);

  // Determinamos qué secciones tienen contenido
  const hasWorkExperience =
    sorteWorkExperience && sorteWorkExperience.length > 0;
  const hasEducation =
    talent?.educaciones && talent.educaciones.length > 0;
  const hasCertifications =
    talent?.certificaciones && talent.certificaciones.length > 0;
  const hasLanguages = talent?.idiomas && talent.idiomas.length > 0;

  const hasTechSkills =
    talent?.habilidadesTecnicas &&
    talent.habilidadesTecnicas.length > 0;

  // Contador para la numeración dinámica
  let sectionNumber = 1;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.fullname}>{fullname}</Text>

        <Text style={styles.paragraph}>
          {talent?.descripcion ||
            t(
              "Sin descripción disponible.",
              "No description available."
            )}
        </Text>

        {/* === Experiencia laboral === */}
        {hasWorkExperience && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {sectionNumber++}.{" "}
              {t("Experiencia laboral", "Work Experience")}
            </Text>

            {sorteWorkExperience.map((exp) => (
              <View
                key={exp.idExperiencia}
                style={styles.itemContainer}
                wrap={false}
              >
                <Text style={styles.bold}>{exp.nombreEmpresa}</Text>
                <View style={styles.flexBetween}>
                  <Text style={styles.bold}>{exp.puesto}</Text>
                  <Text>
                    {formatDateByLang(exp.fechaInicio, language)} -{" "}
                    {exp.flActualidad
                      ? t("Actualidad", "Present")
                      : formatDateByLang(exp.fechaFin, language)}
                  </Text>
                </View>
                <Text style={styles.paragraph}>{exp.funciones}</Text>
              </View>
            ))}
          </View>
        )}

        {/* === Educación === */}
        {hasEducation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {sectionNumber++}. {t("Educación", "Education")}
            </Text>

            {talent?.educaciones?.map((ed, index) => (
              <View
                key={index}
                style={styles.itemContainer}
                wrap={false}
              >
                <Text style={styles.bold}>
                  {ed.nombreInstitucion}
                </Text>
                <View style={styles.flexBetween}>
                  <Text>
                    {ed.carrera} - {ed.grado}
                  </Text>
                  <Text>
                    {formatDateByLang(ed.fechaInicio, language)} -{" "}
                    {formatDateByLang(ed.fechaFin, language)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* === Certificaciones === */}
        {hasCertifications && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {sectionNumber++}.{" "}
              {t("Certificaciones", "Certifications")}
            </Text>

            {talent.certificaciones.map((c, index) => (
              <View
                key={index}
                style={styles.itemContainer}
                wrap={false}
              >
                <Text style={styles.bold}>{c.nombreInstitucion}</Text>
                <View style={styles.flexBetween}>
                  <Text>{c.carrera}</Text>
                  <Text>
                    {formatDateByLang(c.fechaInicio, language)} -{" "}
                    {formatDateByLang(c.fechaFin, language)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* === Habilidades Técnicas === */}
        {hasTechSkills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {sectionNumber++}.{" "}
              {t("Habilidades Técnicas", "Technical Skills")}
            </Text>
            {talent.habilidadesTecnicas?.map((c, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text>
                  {c.nombreHabilidad} - {c.aniosExperiencia}{" "}
                  {t("años", "years")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* === Idiomas === */}
        {hasLanguages && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {sectionNumber++}. {t("Idiomas", "Languages")}
            </Text>

            <View>
              {talent?.idiomas?.map((lan, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text>
                    {lan.nombreIdioma} - {lan.nivelIdioma}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Footer language={language} />
      </Page>
    </Document>
  );
};
