import './App.css';
import axios from "axios";
import React, {useState, useEffect, useRef} from "react";
import Modal from './Modal';

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { collection, doc, deleteDoc, getDocs, query, where, getFirestore } from "firebase/firestore";

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

  const [showingCards, setShowingCards] = useState(false);
  const [response, setResponse] = useState(false);

  // Need a new reference to work correctly with deletion
  const decksRef2 = collection(firestore, "decks");
  const cardsRef2 = collection(firestore, "cards")

  const test = async (e) => {
    const currentCards = query(collection(firestore, "cards"), where("deck", "==", currentDeck));
    const querySnapshotList = await getDocs(currentCards);

    querySnapshotList.forEach((doc) => {
      console.log(doc.data());
      
    });

    console.log(cards);
    console.log(cards[0]);
  };

  useEffect(() => {
    const getDbmessages = async () => {
      const cards = await getDocs(cardsRef.orderBy('createdAt', "asc"));
      setCards(cards.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const decks = await getDocs(decksRef);
      setDecks(decks.docs.reverse().map((doc) => ({ ...doc.data(), id: doc.id})));

      test();
    };

    getDbmessages();

    }, [])

    // Open Delete Deck Modal Screen
    function open() {
      setOpenModal(true);
    };

    // Return to Decks
    function back() {
      setStudying(false)
    };

    // Needed for deletion as without a delay not everything happens before page reload
    function delay(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    };

    // Grab the Deck Document ID using the name of the Current Deck, Delete it, then wait and reload page
    const deleteDeck = async (e) => {
      const currentDoc = query(decksRef2, where('name', '==', currentDeck));
      const querySnapshot = await getDocs(currentDoc);
      querySnapshot.forEach((docu) => {
        deleteDoc(doc(firestore, 'decks', docu.id));
      });
      console.log({currentDeck});
      await delay(300);
      window.location.reload(false);
  };

  function showCards() {
    setShowingCards(true);
  };

  function handleResponse() {
    setResponse(true);
  }

  function handleAnswer() {
    setResponse(false);
  }

  return (
    <div className='page'>
        <button onClick={test}>Test</button>
        <h1>{currentDeck}</h1>
        <button onClick={back}>Decks</button>
        <button onClick={deleteDeck}>Delete Deck</button>
        <div className='Cardsbuttons'>
            <button onClick={open}>Add Card</button>
            <button onClick={showCards}>Study</button>
        </div>
        {openModal && <Modal closeModal={setOpenModal} currentDeck={currentDeck}/>}
        {cards.map((card) => {
          if (card.deck === currentDeck && showingCards === true) {
            return (
              <div>
                  {card.front}
              </div>
            )
          }
        })}
        <div>THIS IS A SPACE</div>
        {showingCards ? <><div>{cards[0].front}</div>
        <div className='responses'>
        {response===true ? <>
            <button onClick={handleAnswer}>Again</button>
            <button onClick={handleAnswer}>Easy</button>
            <button onClick={handleAnswer}>Normal</button>
            <button onClick={handleAnswer}>Hard</button></> : <>
            <button onClick={handleResponse}>Show Response</button>
            </>}
          </div></>
        : <div></div>}
    </div>
  );
}

export default Cards;