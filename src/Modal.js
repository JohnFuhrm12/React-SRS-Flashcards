import './App.css';
import React, {useState, useEffect, useRef} from "react";

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { getDoc, collection, doc, setDoc, deleteDoc, getDocs, query, where, getFirestore, orderBy, limit } from "firebase/firestore";

// Initialize Firebase Database
firebase.initializeApp({
    apiKey: "AIzaSyD7VLFnmHPZlaApmf21EfsNXnYbM-SPhYw",
    authDomain: "react-srs-app-b4511.firebaseapp.com",
    projectId: "react-srs-app-b4511",
    storageBucket: "react-srs-app-b4511.appspot.com",
    messagingSenderId: "369393619126",
    appId: "1:369393619126:web:7889db4611da2724bb9617"
})

const db = firebase.firestore();

const Modal = ({ closeModal, currentDeck, setStudying, getDbmessages, setFailure }) => {
    const [newCardFront, setNewCardFront] = useState("");
    const [newCardBack, setNewCardBack] = useState("");

    const [cards, setCards] = useState([]);
    const [decks, setDecks] = useState([]);
    const [newDeckName, setNewDeckName] = useState("");
    const cardsRef = db.collection('cards');
    const decksRef = db.collection('decks');

    let today = new Date().toLocaleDateString();

    useEffect(() => {
        const getDbmessages = async () => {
          const cards = await getDocs(cardsRef.orderBy('dateTime', "asc"));
          setCards(cards.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
    
          const decks = await getDocs(decksRef.orderBy('dateTime', "asc"));
          setDecks(decks.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
        };
    
        getDbmessages();
        setFailure(false);
    
        }, [])

    const createCard = async (e) => {
        e.preventDefault();
        await cardsRef.add({
            front: newCardFront,
            back: newCardBack,
            deck: currentDeck,
            status: 'NewCard',
            interval: 0,
            dateTime: today,
        });

        setNewCardFront('');
        setNewCardBack('');
        getDbmessages();
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
                <div className="modalTitle">
                    <h1>Add Card:</h1>
                    <div className='x-button'><button className='closeButton' onClick={close}> X </button></div>
                </div>
                <form onSubmit={createCard}>
                <div className='modalInputs'>
                    <label>
                        Front:
                        <input value={newCardFront} onChange={handleChangeFront} placeholder='Type here...' required/>
                    </label>
                    <label>
                        Back:
                        <input value={newCardBack} onChange={handleChangeBack} placeholder='Type here...' required/>
                    </label>
                </div>
                    <button className='addButton'>Add Card</button>
                </form>
            </div>
        </div>
        </>
    )
}

export default Modal;