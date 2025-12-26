import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [agency, setAgency] = useState({ nom: "" });
  const navigate = useNavigate();

  /* ======================
     FETCH AGENCY INFO
  ====================== */
  useEffect(() => {
    let isMounted = true;

    const fetchAgency = async () => {
      try {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!user || !token) return;

        const res = await callApi(
          `/agencies/${user}`,
          "GET",
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );

        if (isMounted) {
          setAgency(res);
        }
      } catch (error) {
        console.error("Erreur chargement agence:", error);
      }
    };

    fetchAgency();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ======================
     LOGOUT
  ====================== */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition";

  const activeClass =
    "flex items-center gap-3 px-4 py-3 rounded-md bg-blue-600 text-white";

  return (
    <div className="w-64 min-h-screen bg-white shadow-lg p-5 flex flex-col">
      {/* Agency Name */}
      <h1 className="text-2xl font-bold text-blue-600 mb-8">
        {agency.nom || "Agence"}
      </h1>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        <NavLink
          to="/agence"
          end
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiHome size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/agence/clients"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiUsers size={20} />
          Clients
        </NavLink>

        <NavLink
          to="/agence/voitures"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FaCar size={20} />
          Voitures
        </NavLink>

        <NavLink
          to="/agence/reservations"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiClipboard size={20} />
          Réservations
        </NavLink>

        <NavLink
          to="/agence/depenses"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiDollarSign size={20} />
          Dépenses
        </NavLink>

        <NavLink
          to="/agence/blacklist"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiAlertTriangle size={20} className="text-red-500" />
          Blacklist
        </NavLink>

        <NavLink
          to="/agence/reparation"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiTool size={20} className="text-orange-500" />
          Réparation
        </NavLink>

        <NavLink
          to="/agence/abonnement"
          className={({ isActive }) => (isActive ? activeClass : linkClass)}
        >
          <FiRepeat size={20} className="text-blue-500" />
          Abonnement
        </NavLink>

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
        className="flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        <FiLogOut size={20} />
        Déconnexion
      </button>
    </div>
  );
};

export default AgenceSidebar;