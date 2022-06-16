import './App.css';
import axios from "axios";
import React, {useState, useEffect, useRef} from "react";
import Modal from './Modal';

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, getFirestore, orderBy, limit } from "firebase/firestore";
import { dblClick } from '@testing-library/user-event/dist/click';

// Initialize Firebase Database
firebase.initializeApp({
  apiKey: "AIzaSyBVSnlgAoDHxbP5B9jcsmC_93nVZmcQZzc",
  authDomain: "react-srs-app.firebaseapp.com",
  projectId: "react-srs-app",
  storageBucket: "react-srs-app.appspot.com",
  messagingSenderId: "1006641704931",
  appId: "1:1006641704931:web:cf116096615ece91c73ad6"
})

const db = firebase.firestore();

const Cards = ( {studying, setStudying, currentDeck, setCurrentDeck}) => {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const cardsRef = db.collection('cards');
  const decksRef = db.collection('decks');

  const [showingCards, setShowingCards] = useState(false);
  const [response, setResponse] = useState(false);

  const [newCards, setNewCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);

  // Need a new reference to work correctly with deletion
  const decksRef2 = collection(db, "decks");
  const cardsRef2 = collection(db, "cards");

  const currentCardRef = doc(db, 'cards', 'selectedCard');

  const test = async (e) => {
    console.log("All Cards:", cards);
    console.log("First Card:", cards[0]);
    console.log("New Cards:", newCards);
    console.log("Review Cards:", reviewCards);
  };

  useEffect(() => {
    const getDbmessages = async () => {
      const cards = await getDocs(cardsRef.orderBy('createdAt', "asc"));
      setCards(cards.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const decks = await getDocs(decksRef);
      setDecks(decks.docs.reverse().map((doc) => ({ ...doc.data(), id: doc.id})));

      const newCardsRef = query(cardsRef2, where('status', '==', 'NewCard'), limit(20));
      const querySnapshot = await getDocs(newCardsRef);
      setNewCards(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const reviewCardsRef = query(cardsRef2, where('status', '==', 'ReviewCard'), limit(50));
      const querySnapshot2 = await getDocs(reviewCardsRef);
      setReviewCards(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
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
        deleteDoc(doc(db, 'decks', docu.id));
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
  };

  function handleAnswer() {
    setResponse(false);
  };

  const handleAnswerEasy = async (e) => {
    setResponse(false);

    await setDoc(doc(db, "cards", newCards[0].id), {
      status: "ReviewCard",
    }, { merge: true });

  };

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
        {newCards.map((card) => {
          if (card.deck === currentDeck && showingCards === true) {
            return (
              <div>
                  {card.front}
              </div>
            )
          }
        })}
        <div>THIS IS A SPACE</div>
        {reviewCards.map((card) => {
          if (card.deck === currentDeck && showingCards === true) {
            return (
              <div>
                  {card.front}
              </div>
            )
          }
        })}
        <div>THIS IS A SPACE</div>
        {showingCards ? <><div>{newCards[0].front}</div>
        <div className='responses'>
        {response===true ? <>
            <button onClick={handleAnswer}>Again</button>
            <button onClick={handleAnswerEasy}>Easy</button>
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