import { useEffect, useState, useMemo } from "react";
import { callApi } from "../components/api";

const ReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [voitures, setVoitures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [FinReservation, setFinReservation] = useState(null);


const [finData, setFinData] = useState({
  dommages: "",
  km_fin: "",
  km_total: "",
  status_payee: "Non payée",
  scoring: 0,
  comment_scoring :""
});


  const handleFinChange = (e) => {
  setFinData({
    ...finData,
    [e.target.name]: e.target.value,
  });
};

  const submitFinReservation = async () => {
  if (!finData.km_fin || !finData.km_total) {
    alert("Veuillez remplir les kilomètres");
    return;
  }

  try {
    await callApi(
      "/reservation-fins",
      "POST",
      {
        reservation_id: FinReservation.id,
        dommages: finData.dommages,
        km_fin: finData.km_fin,
        km_total: finData.km_total,
        status_payee: true,
      },
      {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    );
    console.log(finData);
    await callApi(
      `/reservations/${FinReservation.id}`,
      "PUT", { 
        status: "Terminé" ,
        scoring : finData.scoring,
        comment_scoring : finData.comment_scoring
      },
      {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    );

    await callApi(
      `/voitures/${FinReservation.voiture_id}`,
      "PUT",
      {status: "Disponible"},
      {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    );

    // Mettre réservation en Terminé
    setReservations((prev) =>
      prev.map((r) =>
        r.id === FinReservation.id
          ? { ...r, status: "Terminé" }
          : r
      )
    );

    setFinReservation(null);
    setFinData({})
  } catch (err) {
    console.error(err);
    alert("Erreur lors de la fin de réservation");
  }
};



  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    cin: "",
    clientName: "",
    matricule: "",
    model: "",
    date: "",
    status: "",
  });

  const idAgency = localStorage.getItem("user");

  // ================= LOAD DATA =================
  useEffect(() => {
    const loadData = async () => {
      try {
        const resReservations = await callApi(
          `/reservations/agency/${idAgency}`,
          "GET",
          null,
          { Authorization: `Bearer ${localStorage.getItem("token")}` }
        );

        const resVoitures = await callApi(`/voitures/agency/${idAgency}`, "GET");
        const resClients = await callApi(`/clients/agency/${idAgency}`, "GET");

        setReservations(resReservations);
        setVoitures(resVoitures);
        setClients(resClients);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ================= MAPS (PERFORMANCE) =================
  const clientsMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c])),
    [clients]
  );

  const voituresMap = useMemo(
    () => Object.fromEntries(voitures.map((v) => [v.id, v])),
    [voitures]
  );

  // ================= ORDRE INVERSÉ (DERNIER -> PREMIER) =================
  const sortedReservations = useMemo(
    () => [...reservations].reverse(),
    [reservations]
  );

  // ================= FILTER HANDLER =================
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      cin: "",
      clientName: "",
      matricule: "",
      model: "",
      date: "",
      status: "",
    });
    setCurrentPage(1);
  };

  // ================= FILTER LOGIC =================
  const filteredReservations = useMemo(() => {
    const cinQ = filters.cin.trim().toLowerCase();
    const nameQ = filters.clientName.trim().toLowerCase();
    const matriculeQ = filters.matricule.trim().toLowerCase();
    const modelQ = filters.model.trim().toLowerCase();
    const dateQ = filters.date; // YYYY-MM-DD
    const statusQ = filters.status;

    return sortedReservations.filter((r) => {
      const client = clientsMap[r.client_id];
      const voiture = voituresMap[r.voiture_id];

      const fullName = `${client?.nom || ""} ${client?.prenom || ""}`.trim();

      return (
        (!cinQ || (client?.cin || "").toLowerCase().includes(cinQ)) &&
        (!nameQ || fullName.toLowerCase().includes(nameQ)) &&
        (!matriculeQ || (voiture?.matricule || "").toLowerCase().includes(matriculeQ)) &&
        (!modelQ || (voiture?.model || "").toLowerCase().includes(modelQ)) &&
        (!dateQ || r.date_debut === dateQ || r.date_fin === dateQ) &&
        (!statusQ || r.status === statusQ)
      );
    });
  }, [sortedReservations, filters, clientsMap, voituresMap]);

  // ================= PAGINATION =================
  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / rowsPerPage));

  // clamp currentPage if filters reduce pages
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const currentReservations = filteredReservations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ================= UTILS =================
  const getDuration = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
  };

  // ================= END RESERVATION (OPTIONNEL) =================
  // ⚠️ Change endpoint if needed
  const endReservation = async (reservationId) => {
    if (!window.confirm("Confirmer la fin de cette réservation ?")) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      await callApi(
        `/reservations/${reservationId}/end`,
        "PUT",
        { date_fin: today, status: "Terminé" ,         
          scoring : finData.scoring,
        comment_scoring : finData.comment_scoring },
        { Authorization: `Bearer ${localStorage.getItem("token")}` }
      );

      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservationId ? { ...r, date_fin: today, status: "Terminé" } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la fin de réservation");
    }
  };

  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">Gestion des Réservations</h1>

        <div className="text-sm text-gray-600">
          Total: <b>{filteredReservations.length}</b>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white border rounded p-3 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input
            name="cin"
            placeholder="CIN client"
            value={filters.cin}
            onChange={handleFilterChange}
            className="border p-2 rounded text-sm"
          />

          <input
            name="clientName"
            placeholder="Nom client"
            value={filters.clientName}
            onChange={handleFilterChange}
            className="border p-2 rounded text-sm"
          />

          <input
            name="matricule"
            placeholder="Matricule voiture"
            value={filters.matricule}
            onChange={handleFilterChange}
            className="border p-2 rounded text-sm"
          />

          <input
            name="model"
            placeholder="Modèle voiture"
            value={filters.model}
            onChange={handleFilterChange}
            className="border p-2 rounded text-sm"
          />

          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="border p-2 rounded text-sm"
          />

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border p-2 rounded text-sm"
          >
            <option value="">Tous status</option>
            <option value="En cours">En cours</option>
            <option value="Annuler">Annuler</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-3 py-1 rounded border text-sm hover:bg-gray-100"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Voiture</th>
            <th className="border p-2">Dates</th>
            <th className="border p-2">Durée</th>
            <th className="border p-2">Prix Total</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentReservations.length === 0 ? (
            <tr>
              <td colSpan={8} className="border p-4 text-center text-gray-500">
                Aucun résultat.
              </td>
            </tr>
          ) : (
            currentReservations.map((r) => {
              const client = clientsMap[r.client_id];
              const voiture = voituresMap[r.voiture_id];

              return (
                <tr key={r.id} className="text-center">
                  <td className="border p-2 font-bold">#{r.id}</td>

                  <td className="border p-2">
                    {client ? `${client.nom} ${client.prenom}` : "N/A"}
                    <div className="text-xs text-gray-500">
                      CIN : {client?.cin || "N/A"}
                    </div>
                  </td>

                  <td className="border p-2">
                    {voiture?.model || "N/A"}
                    <div className="text-xs text-gray-500">
                      {voiture?.matricule || "N/A"}
                    </div>
                  </td>

                  <td className="border p-2">
                    <div>{r.date_debut}</div>
                    <div>{r.date_fin}</div>
                  </td>

                  <td className="border p-2">
                    {getDuration(r.date_debut, r.date_fin)} jours
                  </td>

                  <td className="border p-2 font-bold text-green-700">
                    {r.prix_total} DH
                  </td>

                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        r.status === "En cours"
                          ? "bg-blue-600"
                          : r.status === "Annuler"
                          ? "bg-red-600"
                          : r.status === "Terminé"
                          ? "bg-gray-600"
                          : "bg-yellow-500"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedReservation(r)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                      >
                        ℹ️ Info
                      </button>

                        <button
                          onClick={() => setFinReservation(r)}
                          disabled={r.status === "Terminé"}
                          className={`px-3 py-1 rounded text-xs text-white ${
                            r.status === "Terminé"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          ✅ Fin
                        </button>

                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          ◀
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          ▶
        </button>
      </div>

      {/* ================= MODAL INFO ================= */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3">
          <div className="bg-white p-6 rounded w-full max-w-[520px]">
            <div className="flex justify-between items-start gap-3">
              <h2 className="text-xl font-bold">
                Détails Réservation #{selectedReservation.id}
              </h2>

              <button
                onClick={() => setSelectedReservation(null)}
                className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
              >
                ✖
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <b>Client :</b>{" "}
                {clientsMap[selectedReservation.client_id]?.nom}{" "}
                {clientsMap[selectedReservation.client_id]?.prenom}
              </p>
              <p>
                <b>CIN :</b>{" "}
                {clientsMap[selectedReservation.client_id]?.cin}
              </p>

              <hr />

              <p>
                <b>Voiture :</b>{" "}
                {voituresMap[selectedReservation.voiture_id]?.model}
              </p>
              <p>
                <b>Matricule :</b>{" "}
                {voituresMap[selectedReservation.voiture_id]?.matricule}
              </p>

              <hr />

              <p>
                <b>Date début :</b> {selectedReservation.date_debut}
              </p>
              <p>
                <b>Date fin :</b> {selectedReservation.date_fin}
              </p>
              <p>
                <b>Durée :</b>{" "}
                {getDuration(
                  selectedReservation.date_debut,
                  selectedReservation.date_fin
                )}{" "}
                jours
              </p>

              <p className="font-bold text-green-700">
                Prix Total : {selectedReservation.prix_total} DH
              </p>

              <p>
                <b>Status :</b> {selectedReservation.status}
              </p>

              {selectedReservation.contrat && (
                <p>
                  <b>Contrat :</b> {selectedReservation.contrat}
                </p>
              )}

              {selectedReservation.img_etat && (
                <img
                  src={selectedReservation.img_etat}
                  alt="Etat voiture"
                  className="mt-3 rounded w-full max-h-72 object-cover"
                />
              )}
            </div>

            <button
              onClick={() => setSelectedReservation(null)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {/* ================= MODAL INFO ================= */}
      {FinReservation && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3">
    <div className="bg-white p-6 rounded w-full max-w-[520px]">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">
        <h2 className="text-xl font-bold">
          Fin Réservation #{FinReservation.id}
        </h2>

        <button
          onClick={() => setFinReservation(null)}
          className="text-sm px-2 py-1 border rounded hover:bg-gray-100"
        >
          ✖
        </button>
      </div>

      {/* INFO */}
      <div className="mt-4 space-y-1 text-sm">
        <p>
          <b>Client :</b>{" "}
          {clientsMap[FinReservation.client_id]?.nom}{" "}
          {clientsMap[FinReservation.client_id]?.prenom}
        </p>
        <p>
          <b>CIN :</b>{" "}
          {clientsMap[FinReservation.client_id]?.cin}
        </p>

        <p>
          <b>Voiture :</b>{" "}
          {voituresMap[FinReservation.voiture_id]?.model} (
          {voituresMap[FinReservation.voiture_id]?.matricule})
        </p>
      </div>

      <hr className="my-3" />

      {/* FORM */}
      <div className="space-y-3 text-sm">
        <textarea
          name="dommages"
          placeholder="Dommages (si existants)"
          value={finData.dommages}
          onChange={handleFinChange}
          className="border p-2 rounded w-full"
        />

        <input
          type="number"
          name="km_fin"
          placeholder="Kilométrage fin"
          value={finData.km_fin}
          onChange={handleFinChange}
          className="border p-2 rounded w-full"
        />

        <input
          type="number"
          name="km_total"
          placeholder="Kilométrage total parcouru"
          value={finData.km_total}
          onChange={handleFinChange}
          className="border p-2 rounded w-full"
        />

        <select
          name="status_payee"
          value={finData.status_payee}
          onChange={handleFinChange}
          className="border p-2 rounded w-full"
        >
          <option value="Non payée">Non payée</option>
          <option value="Payée">Payée</option>
        </select>

            
        <input
          type="number"
          name="scoring"
          min={0}
          max={100}
          placeholder="scoring client (0-100)"
          value={finData.scoring}
          onChange={handleFinChange}
          className="border p-2 rounded w-full"
        />
        
        <input
          type="text"
          name="comment_scoring"
          placeholder="commante client"
          value={finData.comment_scoring}
          onChange={handleFinChange}
          className="border p-2 rounded w-full"
        />

      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 mt-5">
        <button
          onClick={() => setFinReservation(null)}
          className="px-4 py-1 border rounded"
        >
          Annuler
        </button>

        <button
          onClick={submitFinReservation}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
        >
          Valider Fin
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ReservationPage;
