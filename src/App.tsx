import './App.css';
import { SnackbarProvider } from 'notistack';
import { AppRouter } from './AppRouter';
import { ModalProvider } from './core/context/ModalContext';
import { initAxios } from './core/services/axiosService';

initAxios();

function App() {
  return (
    <ModalProvider>
      <SnackbarProvider maxSnack={2} autoHideDuration={4000}>
        <AppRouter />
      </SnackbarProvider>
    </ModalProvider>
  );
}

export default App;
