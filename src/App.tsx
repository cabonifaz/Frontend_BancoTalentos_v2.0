import './App.css';
import { SnackbarProvider } from 'notistack';
import { AppRouter } from './AppRouter';
import { ModalProvider } from './core/context/ModalContext';
import { initAxios } from './core/services/axiosService';
import { ParamsProvider } from './core/context/ParamsContext';
import { FavouritesProvider } from './core/context/FavouritesContext';

initAxios();

function App() {
  return (
    <SnackbarProvider maxSnack={2} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'center', }}>
      <FavouritesProvider>
        <ParamsProvider>
          <ModalProvider>
            <AppRouter />
          </ModalProvider>
        </ParamsProvider>
      </FavouritesProvider>
    </SnackbarProvider>
  );
}

export default App;
