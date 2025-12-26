import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AgenceSidebar from "./SaidbarAgence";
import Clients from "./Clients";
import VoitureList from "./VoitureList";
import ReservationPage from "./Reservations";
import Reparation from "./Reparation";
import Abonnment from "./Abonnment";
import Depance from "./Depance";
import BlacklistClient from "./Blacklist";
import Dashboard from "./Dashboard";

const AppAgance = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (!token || !user || role !== "agence") {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64">
        <AgenceSidebar />
      </div>

      {/* Page Content */}
      <div className="flex-1 p-6">

        <Routes>
          <Route
            path="/Dashboard"
            element={<Dashboard/>}
          />

          <Route
            path="/clients"
            element={<Clients/>} 
          />

          <Route
            path="/blacklist"
            element={<BlacklistClient/>}
          />

          <Route
            path="/voitures"
            element={<VoitureList/>}
          />
          <Route
            path="/reservations"
            element={<ReservationPage/>}
          />
          <Route
            path="/Reparation"
            element={<Reparation/>}
          />
          <Route
            path="/Abonnment"
            element={<Abonnment/>}
          />

          <Route
            path="/depenses"
            element={<Depance/>}
          />

        </Routes>
      </div>
    </div>
  );
};

export default AppAgance;
