import { useTheme } from "../../../../core/context/ThemeContext";
import { ChartChrome, getChrome, getMeterTrack } from "./chartTheme";

/** Cromo de graficos del tema activo (rejilla, ejes, tinta y pista del medidor). */
export const useChartChrome = (): ChartChrome & { meterTrack: string } => {
  const { isDark } = useTheme();
  return { ...getChrome(isDark), meterTrack: getMeterTrack(isDark) };
};
