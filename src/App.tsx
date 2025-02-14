import './App.css';
import { SnackbarProvider } from 'notistack';
import { AppRouter } from './AppRouter';
import { ModalProvider } from './core/context/ModalContext';
import { initAxios } from './core/services/axiosService';
import { ParamsProvider } from './core/context/ParamsContext';

initAxios();

function App() {
  return (
    <ParamsProvider>
      <ModalProvider>
        <SnackbarProvider maxSnack={2} autoHideDuration={4000}>
          <AppRouter />
        </SnackbarProvider>
      </ModalProvider>
    </ParamsProvider>
  );
}

export default App;
