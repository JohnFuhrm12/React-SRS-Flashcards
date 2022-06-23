import './App.css';

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import {collection, doc, deleteDoc, getDocs, query, where} from "firebase/firestore";

// Initialize Firebase Database
firebase.initializeApp({
    apiKey: "AIzaSyD7VLFnmHPZlaApmf21EfsNXnYbM-SPhYw",
    authDomain: "react-srs-app-b4511.firebaseapp.com",
    projectId: "react-srs-app-b4511",
    storageBucket: "react-srs-app-b4511.appspot.com",
    messagingSenderId: "369393619126",
    appId: "1:369393619126:web:7889db4611da2724bb9617"
});

// Firebase Database
const db = firebase.firestore();

const DeleteDeckModal = ({ closeDeleteModal, currentDeck }) => {
    // Need a new reference to work correctly with deletion
    const decksRef2 = collection(db, "decks");
    const cardsRef2 = collection(db, "cards");

    // Close Modal
    function close() {
        closeDeleteModal(false);
    };

    // Needed for deletion as without a delay not everything happens before page reload
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      };

    // Grab the Deck Document ID using the name of the Current Deck, Delete it and all associated Cards, then wait and reload page
    const deleteDeck = async (e) => {
        const currentDoc = query(decksRef2, where('name', '==', currentDeck));
        const querySnapshot = await getDocs(currentDoc);

        const deckCardsDoc = query(cardsRef2, where('deck', '==', currentDeck));
        const querySnapshotCards = await getDocs(deckCardsDoc);

        querySnapshot.forEach((docu) => {
          deleteDoc(doc(db, 'decks', docu.id));
        });

        querySnapshotCards.forEach((docu) => {
            deleteDoc(doc(db, 'cards', docu.id));
        });

        await delay(500);
        window.location.reload(false);
    };
  
    return (
        <>
        <div className="modalBackground">
            <div className="modalContainer">
                <div className="modalTitle">
                    <div className='x-button'><button className='closeButton' onClick={close}> X </button></div>
                </div>
                <h1>Are you sure you want to delete this deck?</h1>
                <button onClick={deleteDeck} className='deleteButton'>Delete</button>
            </div>
        </div>
        </>
    )
}

export default DeleteDeckModal;