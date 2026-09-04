import { enqueueSnackbar } from "notistack";

export const showWarningSnack = (message: string) =>
  enqueueSnackbar({ message, variant: "warning" });
