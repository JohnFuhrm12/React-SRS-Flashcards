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

const Decks = ( {studying, setStudying, currentDeck, setCurrentDeck}) => {
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

    const createDeck = async (e) => {
        e.preventDefault();
        await decksRef.add({
            name: newDeckName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        window.location.reload(false);
    }

    function study(e) {
        setStudying(true);
        setCurrentDeck(e.target.innerText);
    };

    function handleChange(e) {
        setNewDeckName(e.target.value);
      };


  return (
    <div className='page'>
      <h1 className='title'>React SRS Flashcards</h1>
      <form onSubmit={createDeck}>
          <input value={newDeckName} onChange={handleChange} required/>
          <button>Create Deck</button>
      </form>
      {decks.map((deck) => {
          return (
            <div className='decks'>
              <button onClick={study}>{deck.name}</button>
            </div>
          )
        })}
    </div>
  );
}

export default Decks;