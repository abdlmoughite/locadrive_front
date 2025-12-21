import {Link , BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './auth/Login';
import Acceuil from './ficher/acceuil';
import AppAgance from './agance/AppAgance';


function App() {
  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Acceuil/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<h1>About Page</h1>} />


          <Route path="/admin/*" element={<h1>Admin Dashboard</h1>} />
          <Route path="/agence/*" element={<AppAgance/>} />
          <Route path="/support/*" element={<h1>Support Dashboard</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;