import { useEffect, useState } from "react";
import { database } from "../firebase"; // Importer la configuration Firebase
import { ref as dbRef, get, remove } from "firebase/database"; // Importez 'remove' pour la suppression
import { useNavigate } from "react-router-dom";

function Users() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Fonction pour récupérer les données des utilisateurs
  const fetchUserData = async () => {
    try {
      const userRef = dbRef(database, "users/");
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        setUserData(snapshot.val());
        console.log("Données récupérées :", snapshot.val());
      } else {
        console.log("Aucune donnée disponible");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    }
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async (userId) => {
    try {
      // Afficher une boîte de dialogue de confirmation
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?");

      if (!confirmDelete) {
        console.log("Suppression annulée.");
        return; // Arrêter l'exécution si l'utilisateur annule
      }

      // Suppression des données utilisateur dans la base de données
      const userRef = dbRef(database, `users/${userId}`);
      await remove(userRef);
      console.log(`Données de l'utilisateur ${userId} supprimées de la base de données.`);
  
      // Mettre à jour l'état local pour supprimer l'utilisateur de l'affichage
      setUserData((prevData) => {
        const updatedData = { ...prevData };
        delete updatedData[userId];
        return updatedData;
      });


    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <div className="users">
        <h1>Liste des Utilisateurs</h1>
        {userData ? (
          <div className="tables">
            <div className="table-headers">
              <div>Pays de résidence</div>
              <div>Email</div>
              <div>Prénom</div>
              <div>Nom</div>
              <div>Nationalité</div>
              <div>Téléphone</div>
              <div>ID Utilisateur</div>
              <div>Supprimer</div>
            </div>
            {Object.keys(userData).map((id) => {
              const user = userData[id];
              return (
                <div className="table-rows" key={id}>
                  <div>{user.countryOfResidence}</div>
                  <div>{user.email}</div>
                  <div>{user.firstName}</div>
                  <div>{user.lastName}</div>
                  <div>{user.nationality}</div>
                  <div>{user.phoneNumber}</div>
                  <div>{id}</div>
                  <div>
                    <button
                      className="deleteUserButton"
                      onClick={() => handleDeleteUser(id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Chargement des données...</p>
        )}
      </div>
      <button onClick={() => navigate(-1)} className="back-button">Retour</button>
    </>
  );
}

export default Users;
