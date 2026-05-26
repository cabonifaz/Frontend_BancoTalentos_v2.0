import './App.css';
import { SnackbarProvider } from 'notistack';
import { AppRouter } from './AppRouter';
import { ModalProvider } from './core/context/ModalContext';
import { initAxios } from './core/services/axiosService';
import { FavouritesProvider } from './core/context/FavouritesContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

initAxios();

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={2} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'center', }}>
        <FavouritesProvider>
          <ModalProvider>
            <AppRouter />
          </ModalProvider>
        </FavouritesProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default App;
