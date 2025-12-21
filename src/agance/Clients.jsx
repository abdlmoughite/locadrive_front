import { useEffect, useState } from "react";
import { callApi } from "../components/api";
import { FiSearch, FiPlus, FiUser } from "react-icons/fi";



const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const itemsPerPage = 10;

  // -------------------------------
  // Fetch clients
  // -------------------------------
  const loadClients = async () => {
    const res = await callApi(`/clients/agency/${localStorage.getItem("user")}`, "GET" , null , {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    });
    console.log("Clients API Response:", res);
    setClients(res);
    setFiltered(res);
  };

  useEffect(() => {
    loadClients();
  }, []);

  // -------------------------------
  // Search filter
  // -------------------------------
  useEffect(() => {
    let data = clients;

    if (search.trim() !== "") {
      data = data.filter(
        (client) =>
          client.nom.toLowerCase().includes(search.toLowerCase()) ||
          client.prenom.toLowerCase().includes(search.toLowerCase()) ||
          client.cin.toLowerCase().includes(search.toLowerCase()) ||
          client.tele.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (dateFilter !== "") {
      data = data.filter(
        (client) =>
          new Date(client.created_at).toLocaleDateString() ===
          new Date(dateFilter).toLocaleDateString()
      );
    }

    setFiltered(data);
    setPage(1);
  }, [search, dateFilter, clients]);

  // -------------------------------
  // Pagination
  // -------------------------------
  const start = (page - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // -------------------------------
  // Add Client (Fake demo)
  // -------------------------------

  const [clientadd, setClientAdd] = useState({
    agency_id : localStorage.getItem("user")
  });
  const handlerclientadd = (e) => {
    setClientAdd({ ...clientadd, [e.target.name]: e.target.value });
  }

  const handleAddClient = async (e) => {
    e.preventDefault();
    const res = await callApi(`/clients`, "POST" , clientadd , {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    });
    console.log(res);
    setShowAddPopup(false);
    loadClients();
  };

  // -------------------------------
  // View client details
  // -------------------------------
  const openView = (client) => {
    setSelectedClient(client);
    setShowViewPopup(true);
  };

  return (
    <div className="p-6">

      {/* Title + Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Liste des Clients</h1>

        <button
          onClick={() => setShowAddPopup(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus />
          Ajouter Client
        </button>
      </div>

      {/* Search + Date Filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex items-center bg-white p-2 rounded-lg shadow w-1/3">
          <FiSearch />
          <input
            type="text"
            placeholder="Recherche (nom, cin, télé)..."
            className="ml-2 w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <input
          type="date"
          className="p-2 rounded-lg shadow bg-white"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3">Nom</th>
              <th className="p-3">Prénom</th>
              <th className="p-3">Téléphone</th>
              <th className="p-3">CIN</th>
              <th className="p-3">Scoring</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((client) => (
              <tr
                key={client.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">{client.nom}</td>
                <td className="p-3">{client.prenom}</td>
                <td className="p-3">{client.tele}</td>
                <td className="p-3">{client.cin}</td>
                <td className="p-3">{client.scoring}/100</td>

                <td className="p-3">
                  <button
                    onClick={() => openView(client)}
                    className="text-blue-600 hover:underline"
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-3">
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

      {/* -------------------------- Add Client Popup -------------------------- */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">

            <h2 className="text-xl font-bold mb-4">Ajouter Client</h2>

            <form onSubmit={handleAddClient} className="flex flex-col gap-3">

              <input type="text" onChange={handlerclientadd} name="nom" placeholder="Nom" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="prenom" placeholder="Prénom" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="cin" placeholder="CIN" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="permis" placeholder="Permis" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="tele" placeholder="Téléphone" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="img_cin" placeholder="img_cin" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="img_permis" placeholder="img_permis" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="face2_cin" placeholder="face2_cin" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="face2_prime" placeholder="face2_pirme" className="border p-2 rounded" required />
              <input type="number" max={100} min={0} onChange={handlerclientadd} name="scoring" placeholder="scoring / 100" className="border p-2 rounded" required />
              <input type="text" onChange={handlerclientadd} name="comment_scoring" placeholder="comment_scoring" className="border p-2 rounded" required />
              
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Ajouter
              </button>
            </form>

            <button
              onClick={() => setShowAddPopup(false)}
              className="mt-3 text-red-600 hover:underline"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* -------------------------- View Client Popup -------------------------- */}
      {showViewPopup && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiUser />
              Informations Client
            </h2>

            <p><strong>Nom:</strong> {selectedClient.nom}</p>
            <p><strong>Prénom:</strong> {selectedClient.prenom}</p>
            <p><strong>CIN:</strong> {selectedClient.cin}</p>
            <p><strong>Permis:</strong> {selectedClient.permis}</p>
            <p><strong>Téléphone:</strong> {selectedClient.tele}</p>

            <div className="mt-4">
              <button
                onClick={() => setShowViewPopup(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;