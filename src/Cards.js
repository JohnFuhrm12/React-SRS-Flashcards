import './App.css';
import axios from "axios";
import React, {useState, useEffect, useRef} from "react";
import Modal from './Modal';

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, getFirestore, orderBy, limit } from "firebase/firestore";

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

const Cards = ( {studying, setStudying, currentDeck, setCurrentDeck}) => {
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [cardsExist, setCardsExist] = useState(false);
  const [newCardsExist, setNewCardsExist] = useState(false);
  const cardsRef = db.collection('cards');
  const decksRef = db.collection('decks');

  const [showingCards, setShowingCards] = useState(false);
  const [response, setResponse] = useState(false);

  const [newCards, setNewCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);

  let cardsLength = cards.length;
  let newCardsLength = newCards.length;

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

  const getDbmessages = async () => {
    const cards = await getDocs(cardsRef.orderBy('createdAt', "asc"));
    setCards(cards.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

    const decks = await getDocs(decksRef);
    setDecks(decks.docs.reverse().map((doc) => ({ ...doc.data(), id: doc.id})));

    const newCardsRef = query(cardsRef2, where('status', '==', 'NewCard'), where('deck', '==', currentDeck), limit(20));
    const querySnapshot = await getDocs(newCardsRef);
    setNewCards(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

    const reviewCardsRef = query(cardsRef2, where('status', '==', 'ReviewCard'), where('deck', '==', currentDeck), limit(50));
    const querySnapshot2 = await getDocs(reviewCardsRef);
    setReviewCards(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
  };

  useEffect(() => {
    const getDbmessages = async () => {
      const cards = await getDocs(cardsRef.orderBy('createdAt', "asc"));
      setCards(cards.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const decks = await getDocs(decksRef);
      setDecks(decks.docs.reverse().map((doc) => ({ ...doc.data(), id: doc.id})));

      const newCardsRef = query(cardsRef2, where('status', '==', 'NewCard'), where('deck', '==', currentDeck), limit(20));
      const querySnapshot = await getDocs(newCardsRef);
      setNewCards(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const reviewCardsRef = query(cardsRef2, where('status', '==', 'ReviewCard'), where('deck', '==', currentDeck), limit(50));
      const querySnapshot2 = await getDocs(reviewCardsRef);
      setReviewCards(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
    };

    getDbmessages();

    }, []);

    useEffect(() => {
      DoCardsExist();
    });

    // Open Delete Deck Modal Screen
    function open() {
      setOpenModal(true);
    };

    // Return to Decks
    function back() {
      setStudying(false);
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
    if (cardsExist === true && newCardsExist === true) {
      setShowingCards(true);
    } else {
      alert('No Cards to Study!');
    };
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

    getDbmessages();
  };

  const handleAnswerNormal = async (e) => {
    setResponse(false);

    await setDoc(doc(db, "cards", newCards[0].id), {
      status: "ReviewCard",
    }, { merge: true });

    getDbmessages();
  };

  const handleAnswerHard = async (e) => {
    setResponse(false);

    await setDoc(doc(db, "cards", newCards[0].id), {
      status: "ReviewCard",
    }, { merge: true });

    getDbmessages();
  };

  function DoCardsExist() {
    if (cardsLength > 0) {
      setCardsExist(true);
    };
    if (newCardsLength > 0) {
      setNewCardsExist(true);
    };
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
        {openModal && <Modal closeModal={setOpenModal} currentDeck={currentDeck} setStudying={setStudying} getDbmessages={getDbmessages}/>}
        <h1>All Cards:</h1>
        {cards.map((card) => {
          if (card.deck === currentDeck && showingCards === true) {
            return (
              <div>
                  {card.front}
              </div>
            )
          }
        })}
        <h1>New Cards:</h1>
        {newCards.map((card) => {
          if (card.deck === currentDeck && showingCards === true) {
            return (
              <div>
                  {card.front}
              </div>
            )
          }
        })}
        <h1>Review Cards:</h1>
        {reviewCards.map((card) => {
          if (card.deck === currentDeck && showingCards === true) {
            return (
              <div>
                  {card.front}
              </div>
            )
          }
        })}
        <h1>Current Card:</h1>
        {showingCards ? <><div>{newCards[0].front}</div>
        <div className='responses'>
        {response===true ? <>
            <div>{newCards[0].back}</div>
            <button onClick={handleAnswer}>Again</button>
            <button onClick={handleAnswerEasy}>Easy</button>
            <button onClick={handleAnswerNormal}>Normal</button>
            <button onClick={handleAnswerHard}>Hard</button></> : <>
            <button onClick={handleResponse}>Show Response</button>
            </>}
          </div></>
        : <div></div>}
    </div>
  );
}

export default Cards;