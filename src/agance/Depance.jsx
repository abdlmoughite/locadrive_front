import { useEffect, useState, useMemo } from "react";
import { callApi } from "../components/api";

const Depance = () => {
  const agencyId = localStorage.getItem("user");

  const [depances, setDepances] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // modal
  const [showModal, setShowModal] = useState(false);

  // form
  const [form, setForm] = useState({
    type: "",
    montant: "",
    date: "",
    commentaire: "",
  });

  // -------------------------
  // LOAD DEPANCES
  // -------------------------
  useEffect(() => {
    const fetchDepances = async () => {
      try {
        const res = await callApi(
          `/depenses/agency/${agencyId}`,
          "GET",
          null,
          {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        );

        // dernier ajouté en premier
        setDepances([...res].reverse());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDepances();
  }, [agencyId]);

  // -------------------------
  // TOTAL DEPANCES
  // -------------------------
  const totalDepances = useMemo(() => {
    return depances.reduce(
      (sum, d) => sum + Number(d.montant || 0),
      0
    );
  }, [depances]);

  // -------------------------
  // PAGINATION
  // -------------------------
  const totalPages = Math.ceil(depances.length / rowsPerPage);

  const currentDepances = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return depances.slice(start, start + rowsPerPage);
  }, [depances, page]);

  // -------------------------
  // HANDLE FORM
  // -------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await callApi(
        "/depenses",
        "POST",
        {
          ...form,
          agency_id: agencyId,
        },
        {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      );

      setShowModal(false);
      setForm({
        type: "",
        montant: "",
        date: "",
        commentaire: "",
      });

      // reload
       const res = await callApi(
          `/depenses/agency/${agencyId}`,
          "GET",
          null,
          {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        );

      setDepances([...res].reverse());
      setPage(1);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout de la dépense");
    }
  };

  if (loading) return <p className="p-6">Chargement...</p>;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Dépenses Totales :{" "}
          <span className="text-red-600">
            {totalDepances.toFixed(2)} DH
          </span>
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Créer Dépense
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Type</th>
            <th className="border p-2">Montant</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Commentaire</th>
          </tr>
        </thead>

        <tbody>
          {currentDepances.length === 0 ? (
            <tr>
              <td colSpan={4} className="border p-4 text-center text-gray-500">
                Aucune dépense
              </td>
            </tr>
          ) : (
            currentDepances.map((d) => (
              <tr key={d.id}>
                <td className="border p-2">{d.type}</td>
                <td className="border p-2 text-red-600 font-bold">
                  {d.montant} DH
                </td>
                <td className="border p-2">{d.date}</td>
                <td className="border p-2">
                  {d.commentaire || "-"}
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
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* MODAL CREATE DEPANCE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h3 className="text-xl font-bold mb-4">
              Créer Dépense
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="type"
                placeholder="Type de dépense"
                className="w-full border p-2"
                onChange={handleChange}
                required
              />

              <input
                type="number"
                step="0.01"
                name="montant"
                placeholder="Montant (DH)"
                className="w-full border p-2"
                onChange={handleChange}
                required
              />

              <input
                type="date"
                name="date"
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

export default Depance;