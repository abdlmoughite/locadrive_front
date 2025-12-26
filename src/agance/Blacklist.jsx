import { useState, useMemo } from "react";
import { callApi } from "../components/api";

const BlacklistClient = () => {
  const [cin, setCin] = useState("");
  const [client, setClient] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // -------------------------
  // SEARCH CLIENT BY CIN
  // -------------------------
  const searchClient = async () => {
    if (!cin.trim()) {
      alert("Veuillez saisir un CIN");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ client
      const clientRes = await callApi(
        `/clients/${cin}`,
        "GET",
        null,
        { Authorization: `Bearer ${localStorage.getItem("token")}` }
      );

      setClient(clientRes);

      // 2️⃣ reservations client
      const reservationsRes = await callApi(
        `/reservations/${clientRes.id}`,
        "GET",
        null,
        { Authorization: `Bearer ${localStorage.getItem("token")}` }
      );

      // dernier ajout en premier
      setReservations([...reservationsRes].reverse());
      setPage(1);
    } catch (err) {
      console.error(err);
      alert("Client introuvable");
      setClient(null);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // SCORING GLOBAL (MOYENNE)
  // -------------------------
  const scoringGlobal = useMemo(() => {
    if (reservations.length === 0) return 0;

    const total = reservations.reduce(
      (sum, r) => sum + Number(r.scoring || 0),
      0
    );

    return total / reservations.length;
  }, [reservations]);

  // -------------------------
  // PAGINATION
  // -------------------------
  const totalPages = Math.ceil(reservations.length / rowsPerPage);

  const currentReservations = reservations.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Blacklist Clients
      </h1>

      {/* SEARCH BAR */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Entrer CIN client"
          value={cin}
          onChange={(e) => setCin(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button
          onClick={searchClient}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Rechercher
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      {/* CLIENT INFO */}
      {client && (
        <div className="bg-red-50 border border-red-300 p-4 rounded mb-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            🚨 Client Blacklisté
          </h2>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><b>Nom :</b> {client.nom}</p>
            <p><b>Prénom :</b> {client.prenom}</p>
            <p><b>CIN :</b> {client.cin}</p>

            <p>
              <b>Scoring Global :</b>{" "}
              <span
                className={`font-bold ${
                  scoringGlobal < 50
                    ? "text-red-700"
                    : scoringGlobal < 75
                    ? "text-yellow-600"
                    : "text-green-700"
                }`}
              >
                {scoringGlobal.toFixed(1)}/100
              </span>
            </p>
          </div>
        </div>
      )}

      {/* RESERVATIONS TABLE */}
      {client && (
        <>
          <h3 className="text-lg font-bold mb-2">
            Historique des Réservations
          </h3>

          <table className="w-full border text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Dates</th>
                <th className="border p-2">Voiture</th>
                <th className="border p-2">Scoring</th>
                <th className="border p-2">Commentaire</th>
              </tr>
            </thead>

            <tbody>
              {currentReservations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border p-4 text-center">
                    Aucune réservation
                  </td>
                </tr>
              ) : (
                currentReservations.map((r) => (
                  <tr key={r.id}>
                    <td className="border p-2">
                      {r.date_debut} → {r.date_fin}
                    </td>
                    <td className="border p-2">
                      {r.voiture?.model} ({r.voiture?.matricule})
                    </td>
                    <td className="border p-2 text-center">
                      <span
                        className={`font-bold ${
                          r.scoring < 50
                            ? "text-red-600"
                            : r.scoring < 75
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {r.scoring}/100
                      </span>
                    </td>
                    <td className="border p-2">
                      {r.comment_scoring || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex justify-center gap-2 mt-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BlacklistClient;