import './App.css';
import { SnackbarProvider } from 'notistack';
import { AppRouter } from './AppRouter';
import { ModalProvider } from './core/context/ModalContext';

function App() {
  return (
    <ModalProvider>
      <SnackbarProvider maxSnack={2} autoHideDuration={2000}>
        <AppRouter />
      </SnackbarProvider>
    </ModalProvider>
  );
}

export default App;
