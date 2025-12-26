import React from "react";

/* ======================
   SMALL COMPONENTS
====================== */

// KPI Card
const Card = ({ title, value }) => (
  <div className="bg-white shadow rounded p-4">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

// Chart placeholder
const ChartCard = ({ title }) => (
  <div className="bg-white shadow rounded p-4 h-64 flex items-center justify-center">
    <p className="text-gray-400">{title} (chart here)</p>
  </div>
);


/* ======================
   DASHBOARD PAGE
====================== */

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Dashboard – Location de Voitures
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Véhicules" value="45" />
        <Card title="Revenus (MAD)" value="12 500" />
        <Card title="Véhicules" value="45" />
        <Card title="En reparation" value="45" />
        <Card title="Réservations" value="18" />
        <Card title="Indisponible" value="45" />
        <Card title="Disponible" value="45" />
        <Card title="Clients" value="120" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Revenus Mensuels" />
        <ChartCard title="Réservations Mensuelles" />
      </div>
    </div>
  );
};

export default Dashboard;