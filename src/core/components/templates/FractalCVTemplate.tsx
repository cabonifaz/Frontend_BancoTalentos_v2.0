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
    paddingTop: 70, // Espacio para el header fijo
    paddingBottom: 70, // Espacio para el footer fijo
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },
  // Header fijo en todas las páginas
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
  // Footer fijo en todas las páginas
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

// === Componente Header (se repite automáticamente) ===
const Header = () => (
  <View style={styles.headerFixed} fixed>
    <Image src="/assets/header-fr.png" style={styles.headerImage} />
  </View>
);

// === Componente Footer (se repite automáticamente) ===
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

// === Componente principal PDF ===
export const FractalCVTemplate: React.FC<FractalCVTemplateProps> = ({
  talent,
  language = "ES",
  fullname,
  sorteWorkExperience,
}) => {
  const t = (es: string, en: string) => (language === "ES" ? es : en);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        {/* === Nombre === */}
        <Text style={styles.fullname}>{fullname}</Text>

        {/* === Descripción === */}
        <Text style={styles.paragraph}>
          {talent?.descripcion ||
            t(
              "Sin descripción disponible.",
              "No description available."
            )}
        </Text>

        {/* === 1. Experiencia laboral === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("1. Experiencia laboral", "1. Work Experience")}
          </Text>

          {sorteWorkExperience && sorteWorkExperience.length > 0 ? (
            sorteWorkExperience.map((exp) => (
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
            ))
          ) : (
            <Text
              style={[
                styles.paragraph,
                { fontStyle: "italic", color: "#666" },
              ]}
            >
              {t(
                "No se registran experiencias laborales.",
                "No work experience recorded."
              )}
            </Text>
          )}
        </View>

        {/* === 2. Educación === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("2. Educación", "2. Education")}
          </Text>

          {talent?.educaciones && talent.educaciones.length > 0 ? (
            talent.educaciones.map((ed, index) => (
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
            ))
          ) : (
            <Text
              style={[
                styles.paragraph,
                { fontStyle: "italic", color: "#666" },
              ]}
            >
              {t(
                "No se registran estudios.",
                "No education records."
              )}
            </Text>
          )}
        </View>

        {/* === 3. Certificaciones === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("3. Certificaciones", "3. Certifications")}
          </Text>

          {talent?.certificaciones &&
          talent.certificaciones.length > 0 ? (
            talent.certificaciones.map((c, index) => (
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
            ))
          ) : (
            <Text
              style={[
                styles.paragraph,
                { fontStyle: "italic", color: "#666" },
              ]}
            >
              {t(
                "No se registran certificaciones.",
                "No certifications recorded."
              )}
            </Text>
          )}
        </View>

        {/* === 4. Idiomas === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("4. Idiomas", "4. Languages")}
          </Text>

          {talent?.idiomas && talent.idiomas.length > 0 ? (
            <View>
              {talent.idiomas.map((lan, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text>
                    {lan.nombreIdioma} - {lan.nivelIdioma}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text
              style={[
                styles.paragraph,
                { fontStyle: "italic", color: "#666" },
              ]}
            >
              {t(
                "No se registran idiomas.",
                "No languages recorded."
              )}
            </Text>
          )}
        </View>
        <Footer language={language} />
      </Page>
    </Document>
  );
};
