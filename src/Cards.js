import './App.css';
import axios from "axios";
import React, {useState, useEffect, useRef} from "react";
import Modal from './Modal';

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { getDocs } from "firebase/firestore";

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

const Cards = ( {studying, setStudying, currentDeck, setCurrentDeck}) => {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const cardsRef = firestore.collection('cards');
  const decksRef = firestore.collection('decks');

  useEffect(() => {
    const getDbmessages = async () => {
      const cards = await getDocs(cardsRef);
      setCards(cards.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const decks = await getDocs(decksRef);
      setDecks(decks.docs.reverse().map((doc) => ({ ...doc.data(), id: doc.id})));
    };

    getDbmessages();

    }, [])

    function open() {
      setOpenModal(true);
    };

  return (
    <div className='page'>
        <h1>{currentDeck}</h1>
        <div className='Cardsbuttons'>
            <button onClick={open}>Add Card</button>
            <button>Study</button>
        </div>
        {openModal && <Modal closeModal={setOpenModal} currentDeck={currentDeck}/>}
        {cards.map((card) => {
          if (card.deck === currentDeck) {
            return (
              <div>
                  {card.front}
              </div>
            )
          }
        })}
    </div>
  );
}

export default Cards;