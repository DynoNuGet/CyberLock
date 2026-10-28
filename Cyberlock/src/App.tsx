import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './screens/Login';
import { AuthScreen } from './screens/Cadastro';
import { Home } from './screens/Home';
import { Jogos } from './screens/Jogos';
import { Noticias } from './screens/Noticias';
import { SobreNos } from './screens/SobreNos';
import { Planos } from './screens/Planos';
import { Perfil } from './screens/Perfil';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<AuthScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/jogos" element={<Jogos />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/sobre" element={<SobreNos />} />
        <Route path="/planos" element={<Planos />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </Router>
  );
}

export default App;