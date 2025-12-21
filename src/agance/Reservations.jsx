import { useEffect, useState } from "react";
import { callApi } from "../components/api";

const ReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const idAgency = localStorage.getItem("user");

  // ---------------------------------
  // LOAD RESERVATIONS (AGENCY)
  // ---------------------------------
  useEffect(() => {
    const loadReservations = async () => {
      try {
        const res = await callApi(
          `/reservations/agency/${idAgency}`,
          "GET", null , {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        );
        setReservations(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  if (loading) {
    return <p className="p-6">Chargement...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Gestion des Réservations
      </h1>

      <table className="w-full border rounded text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Client</th>
            <th className="border p-2">Voiture</th>
            <th className="border p-2">Dates</th>
            <th className="border p-2">Prix</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((r) => (
            <tr key={r.id} className="text-center">
              {/* CLIENT */}
              <td className="border p-2">
                {r.client?.nom} {r.client?.prenom}
                <div className="text-xs text-gray-500">
                  CIN: {r.client?.cin}
                </div>
              </td>

              {/* VOITURE */}
              <td className="border p-2">
                {r.voiture?.model}
                <div className="text-xs text-gray-500">
                  {r.voiture?.matricule}
                </div>
              </td>

              {/* DATES */}
              <td className="border p-2">
                <div>{r.date_debut}</div>
                <div>{r.date_fin}</div>
              </td>

              {/* PRIX */}
              <td className="border p-2">
                <div>{r.prix} DH / j</div>
                <b>{r.prix_total} DH</b>
              </td>

              {/* STATUS */}
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${
                    r.status === "confirmée"
                      ? "bg-green-600"
                      : r.status === "annulée"
                      ? "bg-red-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {r.status}
                </span>
              </td>

              {/* ACTIONS */}
              <td className="border p-2 flex gap-2 justify-center">
                <button
                  onClick={() => alert("Voir détails")}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Info
                </button>

                <button
                  onClick={() => alert("Fin réservation")}
                  className="bg-purple-600 text-white px-3 py-1 rounded"
                >
                  Fin
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationPage;
