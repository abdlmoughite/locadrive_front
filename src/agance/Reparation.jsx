import { useEffect, useState } from "react";
import { callApi } from "../components/api";

const Reparation = () => {
  const idagency = localStorage.getItem("user");

  const [voitures, setVoitures] = useState([]);
  const [reparations, setReparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // FORM STATE
  const [form, setForm] = useState({
    voiture_id: "",
    type: "",
    date_debut: "",
    date_fin: "",
    commentaire: "",
    prix: "",
    facture: null,
  });

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const voituresRes = await callApi(`/voitures/agency/${idagency}`, "GET");
        const reparationsRes = await callApi(
          `/preparations/agency/${idagency}`,
          "GET"
        );

        setVoitures(voituresRes || []);
        setReparations(reparationsRes || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idagency]);

  // -------------------------
  // HANDLE FORM
  // -------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("voiture_id", form.voiture_id);
    data.append("agency_id", idagency);
    data.append("type", form.type);
    data.append("date_debut", form.date_debut);
    data.append("date_fin", form.date_fin);
    data.append("commentaire", form.commentaire);
    data.append("prix", form.prix);
    data.append("facture", form.facture);

    try {
      await callApi(`/preparations`, "POST", data, {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      });

      setShowModal(false);
      setForm({
        voiture_id: "",
        type: "",
        date_debut: "",
        date_fin: "",
        commentaire: "",
        prix: "",
        facture: 'facture',
      });

      // reload
      const res = await callApi(
        `/preparations/agency/${idagency}`,
        "GET"
      );
      setReparations(res);
    } catch (e) {
      console.error("Erreur ajout réparation", e);
    }
  };

    const totalReparations = reparations.reduce(
    (acc, r) => acc + (Number(r.prix) || 0),
    0
  );

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Réparations : {totalReparations} DB</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Ajouter Réparation
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Voiture</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Dates</th>
            <th className="border p-2">Prix</th>
            <th className="border p-2">Facture</th>
            <th className="border p-2">commentaire</th>
          </tr>
        </thead>
        <tbody>
          {reparations.map((r) => {
            const v = voitures.find((x) => x.id === r.voiture_id);
            return (
              <tr key={r.id}>
                <td className="border p-2">
                  {v ? `${v.model} (${v.matricule})` : "-"}
                </td>
                <td className="border p-2">{r.type}</td>
                <td className="border p-2">
                  {r.date_debut} → {r.date_fin || "-"}
                </td>
                <td className="border p-2 text-green-6 00">{r.prix} DH</td>

                <td className="border p-2 text-center">
                  {r.facture ? (
                    <button
                      className="text-blue-600 underline"
                    >
                      Voir
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                                
                <td className="border p-2 text-green-6 00">{r.commentaire} DH</td>

              </tr>
            );
          })}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h3 className="text-xl font-bold mb-4">Ajouter Réparation</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                name="voiture_id"
                required
                value={form.voiture_id}
                onChange={handleChange}
                className="w-full border p-2"
              >
                <option value="">-- Sélectionner Voiture --</option>
                {voitures.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} ({v.matricule})
                  </option>
                ))}
              </select>

              <input
                name="type"
                placeholder="Type réparation"
                className="w-full border p-2"
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="date_debut"
                className="w-full border p-2"
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="date_fin"
                className="w-full border p-2"
                onChange={handleChange}
              />

              <input
                type="number"
                step="0.01"
                name="prix"
                placeholder="Prix (DH)"
                className="w-full border p-2"
                onChange={handleChange}
                required
              />

              <textarea
                name="commentaire"
                placeholder="Commentaire"
                className="w-full border p-2"
                onChange={handleChange}
              />
              <textarea
                name="facture"
                placeholder="facture"
                className="w-full border p-2"
                onChange={handleChange}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reparation;
