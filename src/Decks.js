import './App.css';
import React, {useState, useEffect} from "react";

import Login from './Login';

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

// Initialize Firebase Database
firebase.initializeApp({
  apiKey: "AIzaSyD7VLFnmHPZlaApmf21EfsNXnYbM-SPhYw",
  authDomain: "react-srs-app-b4511.firebaseapp.com",
  projectId: "react-srs-app-b4511",
  storageBucket: "react-srs-app-b4511.appspot.com",
  messagingSenderId: "369393619126",
  appId: "1:369393619126:web:7889db4611da2724bb9617"
})

// Firebase Database
const db = firebase.firestore();

const Decks = ( {studying, setStudying, currentDeck, setCurrentDeck, name, setName}) => {
  // Refer to cards and decks
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);

  // Set name for new decks when created and reference cards
  const [newDeckName, setNewDeckName] = useState("");
  const cardsRef = db.collection('cards');

  // Refer to each deck
  const decksRef = db.collection('decks');
  const decksRef2 = collection(db, "decks");


  // On page load grab all the decks and cards and refresh DB
  useEffect(() => {
    const getDbmessages = async () => {
      const cards = await getDocs(cardsRef.orderBy('createdAt', "asc"));
      setCards(cards.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const newDecksRef = query(decksRef2, where('user', '==', name), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(newDecksRef);
      setDecks(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
    };

    getDbmessages();

    }, [])

    // Create a new deck and add it to the DB, then reload too see changes
    const createDeck = async (e) => {
        e.preventDefault();
        await decksRef.add({
            name: newDeckName,
            user: name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        window.location.reload(false);
    }

    // Set the current deck to the name of the deck on the selected button, change to study screen
    function study(e) {
        setStudying(true);
        setCurrentDeck(e.target.innerText);
    };

    // Grab user input
    function handleChange(e) {
        setNewDeckName(e.target.value);
      };

    // Refresh page on logout to fix needing to press button 2x bug
    function handleLogout () {
      setName('');
      window.location.reload(false);
      };

  return (
    <div className='page'>
      {name==='' || name == null ? <Login onNameSubmit={setName} /> : <></>}
      <div className='titleRow'>
        <h1 className='title'>React SRS Flashcards</h1>
        <button className='logoutButton' onClick={handleLogout}>Logout</button>
      </div>
      <form onSubmit={createDeck}>
          <input className='createInput' value={newDeckName} onChange={handleChange} placeholder='Deck Name...' required/>
          <button className='createButton'>Create Deck</button>
      </form>
      <h2 className='decksTitle'>Your Decks:</h2>
      <div className='decksContainer'>
      {decks.map((deck) => {
          return (
            <div className='deck'>
              <button className='deckButton' onClick={study}>{deck.name}</button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default Decks;