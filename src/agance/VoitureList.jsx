import { useEffect, useState } from "react";
import { callApi } from "../components/api";

const VoiturePage = () => {
  const [voitures, setVoitures] = useState([]);
  const [voituresPasDisponible, setVoituresPasDisponible] = useState([]);
  const [voituresDisponible, setVoituresDisponible] = useState([]);
  const [voituresReserve, setVoituresReserve] = useState([]);
  const [voituresReparation, setVoituresReparation] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reparations, setReparations] = useState([]);

  const [form, setForm] = useState({
    voiture_id: "",
    type: "",
    date_debut: "",
    date_fin: "",
    commentaire: "",
    prix: "",
    facture: null,
  });
  const handleChange = (e) => {
    
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
      form.voiture_id = selectedVoiture.id;

    const data = new FormData();
    data.append("voiture_id", selectedVoiture.id);
    data.append("agency_id", idagency);
    data.append("type", form.type);
    data.append("date_debut", form.date_debut);
    data.append("date_fin", form.date_fin);
    data.append("commentaire", form.commentaire);
    data.append("prix", form.prix);
    data.append("facture", form.facture);


    const dataDepance = new FormData();
      dataDepance.append("agency_id", idagency);
      dataDepance.append("montant", form.prix);
      dataDepance.append("date", form.date_debut);
      dataDepance.append("commentaire", form.commentaire);
      dataDepance.append("type", form.type);


    try {
      await callApi(`/preparations`, "POST", data, {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      });
      await callApi(`/voitures/${form.voiture_id}`, "PUT", {
            status :'Reparation'
          } , {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          });
                await callApi(`/depenses`, "POST", dataDepance, {
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
      loadVoitures();
    } catch (e) {
      console.error("Erreur ajout réparation", e);
    }
  };

  const [selectedVoiture, setSelectedVoiture] = useState(null);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [showReparation, setShowReparation] = useState(false);
  const [ShowAnnuler_Reservation, setShowAnnuler_Reservation] = useState(false);
  const [ShowAnnuler_Reparation, setShowAnnuler_Reparation] = useState(false);
  const [Show_Return_Voiture, setShow_Return_Voiture] = useState(false);

  // --------------------------------------------------------
  // LOAD VOITURES
  // --------------------------------------------------------
  const idagency = localStorage.getItem("user");
  const loadVoitures = async () => {
    try {
      const res = await callApi(`/voitures/agency/${idagency}`, "GET");
      setVoitures(res);
      setVoituresDisponible(res.filter(v => v.status === 'Disponible'));
      setVoituresReserve(res.filter(v => v.status === 'Reserve'));
      setVoituresPasDisponible(res.filter(v => v.status === 'Pas disponible'));
      setVoituresReparation(res.filter(v => v.status === 'Reparation'));
    } catch (e) {
      console.log("Erreur : ", e);
    }
  };
  useEffect(() => {
    loadVoitures();
  }, [])

  // --------------------------------------------------------
  // MODAL COMPONENT
  // --------------------------------------------------------
  const Modal = ({ open, onClose, children }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg min-w-[380px] relative">

          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-red-600 text-2xl"
          >
            ×
          </button>

          {children}
        </div>
      </div>
    );
  };
  // --------------------------------------------------------
  // FORMULAIRE AJOUTER VOITURE
  // --------------------------------------------------------
 const AddVoitureForm = () => {
  const [form, setForm] = useState({
    agency_id: localStorage.getItem("user"),
    model: "",
    annee: "",
    etat: "",
    matricule: "",
    color: "",
    description: "",
    options: "",
    prix_jour: "",
    assurance: "",
    carte_grise: "",
    status: "",
    km_debut: "",
    img: null,
  });

  // Handler universel pour tous les inputs TEXT, NUMBER, SELECT, TEXTAREA
  const handlerdata = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {

    await callApi("/voitures", "POST", form, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    });
    setShowAdd(false);
    loadVoitures();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ajouter Voiture</h2>

      {/* MODELE */}
      <input
        placeholder="Modèle"
        name="model"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* ANNEE */}
      <input
        placeholder="Année"
        type="number"
        name="annee"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* ETAT */}
      <select
        name="etat"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      >
        <option value="">État du véhicule</option>
        <option value="neuf">Neuf</option>
        <option value="bon">Bon</option>
        <option value="moyen">Moyen</option>
        <option value="mauvais">Mauvais</option>
      </select>

      {/* MATRICULE */}
      <input
        placeholder="Matricule"
        name="matricule"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* COLOR */}
      <input
        placeholder="Couleur"
        name="color"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description"
        name="description"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      ></textarea>

      {/* OPTIONS */}
      <input
        placeholder="Options (GPS, clim, etc)"
        name="options"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* PRIX / JOUR */}
      <input
        placeholder="Prix/jour"
        type="number"
        name="prix_jour"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* ASSURANCE */}
      <input
        placeholder="Assurance"
        name="assurance"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* CARTE GRISE */}
      <input
        placeholder="N° Carte grise"
        name="carte_grise"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* KM DEBUT */}
      <input
        placeholder="KM début"
        type="number"
        name="km_debut"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      />

      {/* STATUS */}
      <select
        name="status"
        className="border p-2 w-full mb-2"
        onChange={handlerdata}
      >
        <option value="">Status</option>
        <option value="disponible">Disponible</option>
        <option value="en location">En location</option>
        <option value="en panne">En panne</option>
      </select>

      {/* IMAGE */}
      <label className="block font-semibold">Image véhicule :</label>
      {/* <input
        type="file"
        accept="image/*"
        name="img"
        className="border p-2 w-full mb-2"
        onChange={handleImage}
      /> */}

      {/* BUTTON */}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Enregistrer
      </button>
    </div>
  );
};

const ShowReturnVoiture = () => {
    const handleSubmit = async () => {
      await callApi(`/voitures/${selectedVoiture?.id}`, "PUT",{
      status: "Disponible"
    } , {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });
      loadVoitures();
      setShow_Return_Voiture(false);
    };
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          Annuler Reservation — {selectedVoiture?.model}
        </h2>
      <div className="flex">
        <button
          onClick={()=>setShow_Return_Voiture(false)}
          className="bg-green-600 m-5 text-white px-4 py-2 rounded w-full"
        >
          Non
        </button>
        <button
          onClick={handleSubmit}
          className="bg-red-600 m-5 text-white px-4 py-2 rounded w-full"
        >
          Oui
        </button>
</div>
      </div>
    );
}

  // --------------------------------------------------------
  // FORMULAIRE RÉSERVATION (COMPLET)
  // --------------------------------------------------------
 const ReservationForm = () => {
  const [clients, setClients] = useState([]);
  const [clientExistant, setClientExistant] = useState(true);
  const [search, setSearch] = useState("");
  const idAgency = localStorage.getItem("user")

  const [form, setForm] = useState({
    voiture_id: selectedVoiture?.id,
    agency_id : localStorage.getItem("user"),
    client_id: "",
    date_debut: "",
    date_fin: "",
    prix: "",
    prix_total: "",
    contrat : "",
    img_etat : ""
  });

  const [newClient, setNewClient] = useState({
    agency_id : localStorage.getItem("user"),
    nom: "",
    prenom: "",
    cin: "",
    tele: "",
    permis : "",
    img_cin : "",
    img_permis : "",
  });

  // -------------------------------
  // LOAD CLIENTS (AGENCY ONLY)
  // -------------------------------
  useEffect(() => {
    const loadClients = async () => {
      const res = await callApi(`/clients/agency/${idAgency}`, "GET" , null , {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });
      setClients(res);
    };
    loadClients();
  }, []);

  // -------------------------------
  // SEARCH CLIENT
  // -------------------------------
  const filteredClients = clients.filter((c) =>
    `${c.nom} ${c.prenom} ${c.cin}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // -------------------------------
  // AUTO PRICE
  // -------------------------------
  useEffect(() => {
    if (!form.date_debut || !form.date_fin) return;

    const d1 = new Date(form.date_debut);
    const d2 = new Date(form.date_fin);

    const diff = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    const prixJour = selectedVoiture?.prix_jour || 0;

    setForm((prev) => ({
      ...prev,
      prix: prixJour,
      prix_total: diff > 0 ? prixJour * diff : 0,
    }));
  }, [form.date_debut, form.date_fin]);

  // -------------------------------
  // SUBMIT
  // -------------------------------
const handleSubmit = async () => {
  try {

    let clientId = form.client_id;

    // -----------------------------
    // CREATE CLIENT FIRST (FRONT)
    // -----------------------------
    if (!clientExistant) {
      const clientRes = await callApi(
        "/clients",
        "POST",
        newClient, 
        {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      );
      clientId = clientRes.client.id;
    }

    
    // -----------------------------
    // CREATE RESERVATION
    // -----------------------------
    const reservationPayload = {
      ...form,
      client_id: clientId,
      status : 'En cours'
    };
    await callApi("/reservations", "POST", reservationPayload , {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    });
    await callApi(`/voitures/${form.voiture_id}`, "PUT", {
      status : form.status
    } , {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    });
    loadVoitures();
    setShowReservation(false);
  } catch (error) {
    console.error(error);
    alert("Erreur lors de la réservation");
  }
};

return (
  <div>
    <h2 className="text-xl font-bold mb-4">
      Nouvelle Réservation — {selectedVoiture?.model}
    </h2>

    {/* CLIENT TYPE */}
    <div className="flex gap-3 mb-4">
      <button
        onClick={() => setClientExistant(true)}
        className={`px-4 py-1 rounded ${
          clientExistant ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        Client Existant
      </button>

      <button
        onClick={() => setClientExistant(false)}
        className={`px-4 py-1 rounded ${
          !clientExistant ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        Nouveau Client
      </button>
    </div>

    {/* CLIENT EXISTANT */}
    {clientExistant && (
      <>
        <input
          placeholder="Rechercher client (nom / CIN)"
          className="border p-2 w-full mb-3 rounded"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-4 rounded"
          onChange={(e) =>
            setForm({ ...form, client_id: e.target.value })
          }
        >
          <option value="">— Choisir Client —</option>
          {filteredClients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom} {c.prenom} — {c.cin}
            </option>
          ))}
        </select>
      </>
    )}

    {/* NOUVEAU CLIENT */}
    {!clientExistant && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          placeholder="Nom"
          className="border p-2 rounded"
          onChange={(e) =>
            setNewClient({ ...newClient, nom: e.target.value })
          }
        />

        <input
          placeholder="Prénom"
          className="border p-2 rounded"
          onChange={(e) =>
            setNewClient({ ...newClient, prenom: e.target.value })
          }
        />

        <input
          placeholder="CIN"
          className="border p-2 rounded"
          onChange={(e) =>
            setNewClient({ ...newClient, cin: e.target.value })
          }
        />

        <input
          placeholder="Téléphone"
          className="border p-2 rounded"
          onChange={(e) =>
            setNewClient({ ...newClient, tele: e.target.value })
          }
        />

        <input
          type="text"
          className="border p-2 rounded"
          onChange={(e) =>
            setNewClient({ ...newClient, permis: e.target.value })
          }
        />

        <input
          type="text"
          className="border p-2 rounded"
          onChange={(e) =>
            setNewClient({ ...newClient, img_cin: e.target.value })
          }
        />

        <input
          type="text"
          className="border p-2 rounded md:col-span-3"
          onChange={(e) =>
            setNewClient({ ...newClient, img_permis: e.target.value })
          } 
        />
      </div>
    )}

    {/* DATES + FILES */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <div>
        <label>Date début</label>
        <input
          type="date"
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setForm({ ...form, date_debut: e.target.value })
          }
        />
      </div>

      <div>
        <label>Date fin</label>
        <input
          type="date"
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setForm({ ...form, date_fin: e.target.value })
          }
        />
      </div>

      <div>
        <label>Image état</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setForm({ ...form, img_etat: e.target.value })
          }
        />
      </div>

      <div className="md:col-span-3">
        <label>Contrat</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setForm({ ...form, contrat: e.target.value })
          }
        />
      </div>
    </div>

    {/* PRIX + STATUS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
      <div>
        <label>Prix / Jour</label>
        <input
          type="number"
          className="border p-2 w-full rounded bg-gray-100"
          value={form.prix}
          readOnly
        />
      </div>

      <div>
        <label>Prix Total</label>
        <input
          type="number"
          className="border p-2 w-full rounded bg-gray-100"
          value={form.prix_total}
          readOnly
        />
      </div>

      <div>
        <label>Status</label>
        <select
          className="border p-2 w-full rounded"
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option defaultChecked>-----Status-----</option>
          <option value="Reserve">Réservée</option>
          <option value="Pas disponible">Indisponible</option>
        </select>
      </div>
    </div>

    <button
      onClick={handleSubmit}
      className="bg-green-600 text-white px-4 py-2 rounded w-full"
    >
      Valider Réservation
    </button>
  </div>
);
};
  // --------------------------------------------------------
  // FORMULAIRE RÉPARATION
  // --------------------------------------------------------
  const ReparationForm = () => {
    const [form, setForm] = useState({
      voiture_id: selectedVoiture?.id,
      description: "",
      cout: "",
    });

    const handleSubmit = async () => {
      await callApi("/reparations", "POST", form);
      await callApi(`/voitures/${selectedVoiture?.id}`, "PUT", {
      status: "Reparation"
      } , {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });
      setShowReparation(false);
      loadVoitures();
    };

    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          Nouvelle Réparation — {selectedVoiture?.model}
        </h2>

        <textarea
          placeholder="Description"
          className="border p-2 w-full mb-2"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          placeholder="Coût"
          type="number"
          className="border p-2 w-full mb-2"
          onChange={(e) => setForm({ ...form, cout: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="bg-yellow-600 text-white px-4 py-2 rounded w-full"
        >
          Enregistrer Réparation
        </button>
      </div>
    );
  };

  const AnnulerReservation = () => {
    const handleSubmit = async () => {
      await callApi(`/voitures/${selectedVoiture?.id}`, "PUT", {
      status: "Disponible"
    } , {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });
      loadVoitures();
      setShowAnnuler_Reservation(false);
    };
    
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          Return Voiture — {selectedVoiture?.model}
        </h2>
      <div className="flex">
        <button
          onClick={()=>setShow_Return_Voiture(false)}
          className="bg-green-600 m-5 text-white px-4 py-2 rounded w-full"
        >
          Non
        </button>
        <button
          onClick={handleSubmit}
          className="bg-red-600 m-5 text-white px-4 py-2 rounded w-full"
        >
          Oui
        </button>
</div>
      </div>
    );
  };
  const AnnulerReparation = () => {
    const handleSubmit = async () => {
      await callApi(`/voitures/${selectedVoiture?.id}`, "PUT", {
      status: "Disponible"
    } , {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });
      loadVoitures();
      setShowAnnuler_Reparation(false);
    };
    
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          Return Voiture — {selectedVoiture?.model}
        </h2>
      <div className="flex">
        <button
          onClick={()=>setShow_Return_Voiture(false)}
          className="bg-green-600 m-5 text-white px-4 py-2 rounded w-full"
        >
          Non
        </button>
        <button
          onClick={handleSubmit}
          className="bg-red-600 m-5 text-white px-4 py-2 rounded w-full"
        >
          Oui
        </button>
</div>
      </div>
    );
  };

const [showInfo, setShowInfo] = useState(false);


  // --------------------------------------------------------
  // Info
  // ---------------------------------------------
  const InfoVoitureModal = () => {
  if (!selectedVoiture) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Détails Voiture — {selectedVoiture.model}
      </h2>

      <img
        src={`http://127.0.0.1:8000/storage/${selectedVoiture.img}`}
        className="w-full h-40 object-cover rounded mb-4"
      />

      <div className="space-y-2 text-sm">
        <p><b>Matricule :</b> {selectedVoiture.matricule}</p>
        <p><b>Année :</b> {selectedVoiture.annee}</p>
        <p><b>État :</b> {selectedVoiture.etat}</p>
        <p><b>Couleur :</b> {selectedVoiture.color}</p>
        <p><b>Prix / Jour :</b> {selectedVoiture.prix_jour} DH</p>
        <p><b>KM Début :</b> {selectedVoiture.km_debut}</p>
        <p><b>Assurance :</b> {selectedVoiture.assurance}</p>
        <p><b>Carte Grise :</b> {selectedVoiture.carte_grise}</p>
        <p><b>Status :</b> {selectedVoiture.status}</p>

        <div className="bg-gray-100 p-2 rounded">
          <b>Description :</b>
          <p>{selectedVoiture.description}</p>
        </div>

        <div className="bg-gray-100 p-2 rounded">
          <b>Options :</b>
          <p>{selectedVoiture.options}</p>
        </div>
      </div>
    </div>
  );
};


  // --------------------------------------------------------
  // PAGE UI
  // --------------------------------------------------------
  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Voitures</h1>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Ajouter Voiture
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Image</th>
            <th className="border p-2">Modèle</th>
            <th className="border p-2">Matricule</th>
            <th className="border p-2">Prix/Jour</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
                  
<tbody>

  {/* ================= VOITURES DISPONIBLES ================= */}
  {voituresDisponible.length > 0 && (
    <tr>
      <td colSpan="5" className="bg-green-100 text-green-700 font-semibold px-3 py-2">
        🚗 Voitures Disponibles ( {voituresDisponible.length} )
      </td>
    </tr>
  )}

  {voituresDisponible.map((v) => (
    <tr key={v.id} className="text-center hover:bg-gray-50 transition">
      <td className="border p-2">
        <img
          src={`http://127.0.0.1:8000/storage/${v.img}`}
          className="w-20 h-14 object-cover rounded mx-auto"
        />
      </td>

      <td className="border p-2 font-medium">{v.model}</td>
      <td className="border p-2">{v.matricule}</td>
      <td className="border p-2 font-semibold">{v.prix_jour} DH</td>

      <td className="border p-2 flex gap-2 justify-center">
        <button
          onClick={() => {
            setSelectedVoiture(v);
            setShowReservation(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
        >
          Réserver
        </button>

        <button
          onClick={() => {
            setSelectedVoiture(v);
            setShowInfo(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Info
        </button>

        <button
          onClick={() => {
            setShowModal(true);
            setSelectedVoiture(v);   
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
        >
          Réparation  
        </button>
      </td>
    </tr>
  ))}
  {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h3 className="text-xl font-bold mb-4">Ajouter Réparation</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
                <h1>{selectedVoiture.model}-- {selectedVoiture.matricule}</h1>

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


  {/* ================= VOITURES RÉSERVÉES ================= */}
  {voituresReserve.length > 0 && (
    <tr>
      <td colSpan="5" className="bg-yellow-100 text-yellow-700 font-semibold px-3 py-2">
        📅 Voitures Réservées ( {voituresReserve.length} )
      </td>
    </tr>
  )}

  {voituresReserve.map((v) => (
    <tr key={v.id} className="text-center bg-yellow-50">
      <td className="border p-2">
        <img
          src={`http://127.0.0.1:8000/storage/${v.img}`}
          className="w-20 h-14 object-cover rounded mx-auto opacity-80"
        />
      </td>

      <td className="border p-2">{v.model}</td>
      <td className="border p-2">{v.matricule}</td>
      <td className="border p-2">{v.prix_jour} DH</td>

      <td className="border p-2 flex gap-2 justify-center">
        <span onClick={() => {
            setSelectedVoiture(v);
            setShowAnnuler_Reservation(true);
          }} className="px-3 py-1 cursor-pointer bg-red-500 text-white rounded text-sm">
          Annuler Réservée
        </span>

        <button
          onClick={() => {
            setSelectedVoiture(v);
            setShowInfo(true);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Info
        </button>
      </td>
    </tr>
  ))}
  {/* ================= VOITURES Reparation ================= */}
  {voituresReparation.length > 0 && (
    <tr>
      <td colSpan="5" className="bg-yellow-100 text-yellow-700 font-semibold px-3 py-2">
        🛠️ Voitures Reparation ( {voituresReparation.length} )
      </td>
    </tr>
  )}

  {voituresReparation.map((v) => (
    <tr key={v.id} className="text-center bg-yellow-50">
      <td className="border p-2">
        <img
          src={`http://127.0.0.1:8000/storage/${v.img}`}
          className="w-20 h-14 object-cover rounded mx-auto opacity-80"
        />
      </td>
      <td className="border p-2">{v.model}</td>
      <td className="border p-2">{v.matricule}</td>
      <td className="border p-2">{v.prix_jour} DH</td>
      <td className="border p-2 flex gap-2 justify-center">
        <span onClick={() => {
            setSelectedVoiture(v);
            setShowAnnuler_Reparation(true);
          }} className="px-3 py-1 cursor-pointer bg-red-500 text-white rounded text-sm">
          Annuler Reparation  
        </span>
        <button
          onClick={() => {
            setSelectedVoiture(v);
            setShowInfo(true);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Info
        </button>
      </td>
    </tr>
  ))}

  {/* ================= VOITURES PAS DISPONIBLES ================= */}
  {voituresPasDisponible.length > 0 && (
    <tr>
      <td colSpan="5" className="bg-red-100 text-red-700 font-semibold px-3 py-2">
        ❌ Voitures Indisponibles ( {voituresPasDisponible.length} )
      </td>
    </tr>
  )}

  {voituresPasDisponible.map((v) => (
    <tr key={v.id} className="text-center bg-red-50">
      <td className="border p-2">
        <img
          src={`http://127.0.0.1:8000/storage/${v.img}`}
          className="w-20 h-14 object-cover rounded mx-auto opacity-60"
        />
      </td>

      <td className="border p-2">{v.model}</td>
      <td className="border p-2">{v.matricule}</td>
      <td className="border p-2">{v.prix_jour} DH</td>

      <td className="border p-2 flex gap-2 justify-center">
        <span onClick={()=>{
          setShow_Return_Voiture(true);
          setSelectedVoiture(v)}} 
          className="px-3 py-1 bg-green-600 cursor-pointer text-white rounded text-sm">
          Disponible
        </span>
        <button
          onClick={() => {
            setSelectedVoiture(v);
            setShowInfo(true);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Info
        </button>
      </td>

    </tr>
  ))}

</tbody>
      </table>
      {/* ------------------ MODALS ------------------ */}

      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <AddVoitureForm />
      </Modal>
      <Modal open={showInfo} onClose={() => setShowInfo(false)}>
        <InfoVoitureModal />
      </Modal>
      <Modal open={showReservation} onClose={() => setShowReservation(false)}>
        <ReservationForm />
      </Modal>
      <Modal open={showReparation} onClose={() => setShowReparation(false)}>
        <ReparationForm />
      </Modal>
      <Modal open={ShowAnnuler_Reservation} onClose={() => setShowAnnuler_Reservation(false)}>
        <AnnulerReservation />
      </Modal>
      <Modal open={ShowAnnuler_Reparation} onClose={() => setShowAnnuler_Reparation(false)}>
        <AnnulerReparation />
      </Modal>
      <Modal open={Show_Return_Voiture} onClose={() => setShow_Return_Voiture(false)}>
        <ShowReturnVoiture />
      </Modal>
    </div>
  );
};

export default VoiturePage;