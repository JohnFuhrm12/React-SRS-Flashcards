import './App.css';
import React, {useState, useEffect, useRef} from "react";

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { getDoc, getDocs } from "firebase/firestore";

// Initialize Firebase Database
firebase.initializeApp({
  apiKey: "AIzaSyBVSnlgAoDHxbP5B9jcsmC_93nVZmcQZzc",
  authDomain: "react-srs-app.firebaseapp.com",
  projectId: "react-srs-app",
  storageBucket: "react-srs-app.appspot.com",
  messagingSenderId: "1006641704931",
  appId: "1:1006641704931:web:cf116096615ece91c73ad6"
})

const firestore = firebase.firestore();

const Modal = ({ closeModal, currentDeck }) => {
    const [newCardFront, setNewCardFront] = useState("");
    const [newCardBack, setNewCardBack] = useState("");

    const [cards, setCards] = useState([]);
    const [decks, setDecks] = useState([]);
    const [newDeckName, setNewDeckName] = useState("");
    const cardsRef = firestore.collection('cards');
    const decksRef = firestore.collection('decks');

    useEffect(() => {
        const getDbmessages = async () => {
          const cards = await getDocs(cardsRef.orderBy('createdAt', "asc"));
          setCards(cards.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
    
          const decks = await getDocs(decksRef.orderBy('createdAt', "asc"));
          setDecks(decks.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
        };
    
        getDbmessages();
    
        }, [])

    const createCard = async (e) => {
        e.preventDefault();
        await cardsRef.add({
            front: newCardFront,
            back: newCardBack,
            deck: currentDeck,
            status: 'NewCard',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        window.location.reload(false);
    };

    function close() {
        closeModal(false)
    };

    function handleChangeFront(e) {
        setNewCardFront(e.target.value);
      };

      function handleChangeBack(e) {
        setNewCardBack(e.target.value);
      };

    return (
        <>
        <div className="modalBackground">
            <div className="modalContainer">
                <button onClick={close}> X </button>
                <div className="modalTitle">
                    <h1>Add Card</h1>
                </div>
                <form onSubmit={createCard}>
                    <label>
                        Front:
                        <input value={newCardFront} onChange={handleChangeFront} required/>
                    </label>
                    <label>
                        Back:
                        <input value={newCardBack} onChange={handleChangeBack} required/>
                    </label>
                    <button>Add Card</button>
                </form>
            </div>
        </div>
        
        </>
    )
}

export default Modal;