import React, { useEffect, useState } from "react";
import { callApi } from "../components/api";

/* ======================
   COMPONENTS
====================== */

const Card = ({ title, value }) => (
  <div className="bg-white shadow rounded p-4">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const ChartCard = ({ title }) => (
  <div className="bg-white shadow rounded p-4 h-64 flex items-center justify-center">
    <p className="text-gray-400">{title} (chart ici)</p>
  </div>
);

/* ======================
   DASHBOARD
====================== */

const Dashboard = () => {
  const idagency = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  // DATA
  const [voitures, setVoitures] = useState([]);
  const [clients, setClients] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [reservations, setReservations] = useState([]);

  // TOTALS
  const [totalDepenses, setTotalDepenses] = useState(0);
  const [totalRevenus, setTotalRevenus] = useState(0);

  // STATUS VOITURES
  const [voituresDisponible, setVoituresDisponible] = useState([]);
  const [voituresReserve, setVoituresReserve] = useState([]);
  const [voituresPasDisponible, setVoituresPasDisponible] = useState([]);
  const [voituresReparation, setVoituresReparation] = useState([]);
  const [voituresMort, setVoituresMort] = useState([]);

  // DATE FILTER
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [applyFilter, setApplyFilter] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!idagency || !token) return;

        /* 🔹 Voitures */
        const resVoitures = await callApi(
          `/voitures/agency/${idagency}`,
          "GET",
          null,
          { Authorization: `Bearer ${token}` }
        );

        if (!isMounted) return;

        setVoituresMort(resVoitures.filter(v => v.status === "mort"));
        setVoitures(resVoitures.filter(v => v.status !=="mort"));
        setVoituresDisponible(resVoitures.filter(v => v.status === "Disponible"));
        setVoituresReserve(resVoitures.filter(v => v.status === "Reserve"));
        setVoituresPasDisponible(resVoitures.filter(v => v.status === "Pas disponible"));
        setVoituresReparation(resVoitures.filter(v => v.status === "Reparation"));

        /* 🔹 Clients */
        const resClients = await callApi(
          `/clients/agency/${idagency}`,
          "GET",
          null,
          { Authorization: `Bearer ${token}` }
        );
        if (isMounted) setClients(resClients);

        /* 🔹 Dépenses */
        const resDepenses = await callApi(
          `/depenses/agency/${idagency}`,
          "GET",
          null,
          { Authorization: `Bearer ${token}` }
        );

        /* 🔹 Réservations */
        const resReservations = await callApi(
          `/reservations/agency/${idagency}`,
          "GET",
          null,
          { Authorization: `Bearer ${token}` }
        );

        /* 🔹 FILTER PAR DATE */
const filterByDate = (items, field) => {
  if (!dateDebut && !dateFin) return items;

  return items.filter(item => {
    const d = new Date(item[field]);
    if (dateDebut && d < new Date(dateDebut)) return false;
    if (dateFin && d > new Date(dateFin)) return false;
    return true;
  });
};


const depensesFiltered = applyFilter
  ? filterByDate(resDepenses, "date")
  : resDepenses;

const reservationsFiltered = applyFilter
  ? filterByDate(resReservations, "date_debut")
  : resReservations;


        if (isMounted) {
          setDepenses(depensesFiltered);
          setReservations(reservationsFiltered);

          setTotalDepenses(
            depensesFiltered.reduce((sum, d) => sum + Number(d.montant || 0), 0)
          );

          setTotalRevenus(
            reservationsFiltered.reduce((sum, r) => sum + Number(r.prix || 0), 0)
          );
        }

      } catch (error) {
        console.error("Erreur Dashboard:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
}, [idagency, token, applyFilter]);

  const beneficeNet = totalRevenus - totalDepenses;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Dashboard – Location de Voitures
      </h1>

      {/* FILTER DATE */}
<div className="flex flex-wrap items-end gap-4 mb-6 bg-white p-4 rounded shadow">
  <div>
    <label className="block text-sm text-gray-500">Date début</label>
    <input
      type="date"
      value={dateDebut}
      onChange={(e) => setDateDebut(e.target.value)}
      className="border p-2 rounded"
    />
  </div>

  <div>
    <label className="block text-sm text-gray-500">Date fin</label>
    <input
      type="date"
      value={dateFin}
      onChange={(e) => setDateFin(e.target.value)}
      className="border p-2 rounded"
    />
  </div>

  <button
    onClick={() => setApplyFilter(true)}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Filtrer
  </button>

  <button
    onClick={() => {
      setDateDebut("");
      setDateFin("");
      setApplyFilter(false);
    }}
    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
  >
    Réinitialiser
  </button>
</div>


      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Véhicules Actif" value={voitures.length} />
        <Card title="Disponible" value={voituresDisponible.length} />
        <Card title="Réservées" value={voituresReserve.length} />
        <Card title="En réparation" value={voituresReparation.length} />
        <Card title="Indisponible" value={voituresPasDisponible.length} />
        <Card title="Clients" value={clients.length} />
        <Card title="Dépenses (MAD)" value={totalDepenses} />
        <Card title="Revenus (MAD)" value={totalRevenus} />
        <Card title="Bénéfice Net (MAD)" value={beneficeNet} />
        <Card title="Total Véhicules mort" value={voituresMort.length} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Revenus Mensuels" />
        <ChartCard title="Réservations Mensuelles" />
      </div>
    </div>
  );
};

export default Dashboard;
