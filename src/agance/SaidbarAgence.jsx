import { NavLink, useNavigate } from "react-router-dom";
import { useState ,useEffect } from "react";

import {
  FiUsers,
  FiClipboard,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiHome,
  FiAlertTriangle,
  FiTool,
  FiRepeat,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import { callApi } from "../components/api";

const AgenceSidebar = () => {
    const [agency, setAgency] = useState({});
    useEffect(async () =>  {
        const user = localStorage.getItem("user");
        const res = await callApi(`/agencies/${user}`, "GET" , null , {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        });
        console.log("Agence Info:", res);
        setAgency(res);
    }, []);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition";

  const activeClass =
    "flex items-center gap-3 px-4 py-3 rounded-md bg-blue-600 text-white";

  return (
    <div className="w-64 min-h-screen bg-white shadow-lg p-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-8">{agency.nom}</h1>

      <nav className="flex flex-col gap-2">

        {/* Dashboard */}
        <NavLink
          to="/agence"
          end
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiHome size={20} />
          Dashboard
        </NavLink>

        {/* Clients */}
        <NavLink
          to="/agence/clients"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiUsers size={20} />
          Clients
        </NavLink>

        {/* Voitures */}
        <NavLink
          to="/agence/voitures"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FaCar size={20} />
          Voitures
        </NavLink>

        {/* Reservations */}
        <NavLink
          to="/agence/reservations"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiClipboard size={20} />
          Réservations
        </NavLink>
        
        {/* Dépenses */}
        <NavLink
          to="/agence/depenses"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiDollarSign size={20} />
          Dépenses
        </NavLink>

        {/* Blacklist */}
        <NavLink
          to="/agence/blacklist"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiAlertTriangle size={20} className="text-red-500" />
          Blacklist
        </NavLink>

        <NavLink
          to="/agence/Reparation"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiTool size={20} className="text-orange-500" />
          Réparation
        </NavLink>
        <NavLink
          to="/agence/Abonnment"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiRepeat size={20} className="text-blue-500" />
          Abonnement
        </NavLink>


        {/* Settings */}
        <NavLink
          to="/agence/settings"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiSettings size={20} />
          Paramètres
        </NavLink>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-10 flex items-center gap-3 px-4 py-3 w-full bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        <FiLogOut size={20} />
        Déconnexion
      </button>
    </div>
  );
};

export default AgenceSidebar;