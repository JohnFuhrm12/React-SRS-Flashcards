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

  const [failure, setFailure] = useState(false);

  const [showingCards, setShowingCards] = useState(false);
  const [response, setResponse] = useState(false);

  const [newCards, setNewCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);

  const [finish, setFinish] = useState(false);

  let cardsLength = cards.length;
  let newCardsLength = newCards.length;
  let reviewCardsLength = reviewCards.length;

  let today = new Date().toLocaleDateString();

  const currentMonth = Number(today.split(/[/]/)[0]);
  const currentDay = Number(today.split(/[/]/)[1]);
  const currentYear = Number(today.split(/[/]/)[2]);

  // Need a new reference to work correctly with deletion
  const decksRef2 = collection(db, "decks");
  const cardsRef2 = collection(db, "cards");

  const currentCardRef = doc(db, 'cards', 'selectedCard');

  const test = async (e) => {
    console.log("All Cards:", cards);
    console.log("First Card:", cards[0]);
    console.log("New Cards:", newCards);
    console.log("Review Cards:", reviewCards);
    getDateTime();
    console.log(today);
    console.log("Month:", currentMonth);
    console.log("Day:", currentDay);
    console.log("Year:", currentYear);
    console.log("Failure:", failure);
    console.log(cardsLength);
  };

  const getDbmessages = async () => {
    const currentCardsRef = query(cardsRef2, where('deck', '==', currentDeck));
    const currentQuerySnapshot = await getDocs(currentCardsRef);
    setCards(currentQuerySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

    const decks = await getDocs(decksRef);
    setDecks(decks.docs.reverse().map((doc) => ({ ...doc.data(), id: doc.id})));

    const newCardsRef = query(cardsRef2, where('status', '==', 'NewCard'), where('deck', '==', currentDeck), limit(20));
    const querySnapshot = await getDocs(newCardsRef);
    setNewCards(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

    const reviewCardsRef = query(cardsRef2, where('status', '==', 'ReviewCard'), where('deck', '==', currentDeck), where('dateTime', '==', today), limit(50));
    const querySnapshot2 = await getDocs(reviewCardsRef);
    setReviewCards(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
  };

  useEffect(() => {
    const getDbmessages = async () => {
      const currentCardsRef = query(cardsRef2, where('deck', '==', currentDeck));
      const currentQuerySnapshot = await getDocs(currentCardsRef);
      setCards(currentQuerySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const decks = await getDocs(decksRef);
      setDecks(decks.docs.reverse().map((doc) => ({ ...doc.data(), id: doc.id})));

      const newCardsRef = query(cardsRef2, where('status', '==', 'NewCard'), where('deck', '==', currentDeck), limit(20));
      const querySnapshot = await getDocs(newCardsRef);
      setNewCards(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id})));

      const reviewCardsRef = query(cardsRef2, where('status', '==', 'ReviewCard'), where('deck', '==', currentDeck), where('dateTime', '==', today), limit(50));
      const querySnapshot2 = await getDocs(reviewCardsRef);
      setReviewCards(querySnapshot2.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
    };

    getDbmessages();
    getDateTime();

    }, []);

    useEffect(() => {
      DoCardsExist();
      FinishSession();
    });

    function FinishSession() {
      if (newCardsLength === 0 && reviewCardsLength === 0) {
        setFinish(true);
      } else {
        setFinish(false);
      };
    };

    const getDateTime = async (e) => {
      const allNew = query(cardsRef2, where('status', '==', 'NewCard'));
      const newSnapshot = await getDocs(allNew);
      newSnapshot.forEach((docu) => {
        setDoc(doc(db, "cards", docu.id), {
          dateTime: today,
        }, { merge: true });
      });
    };

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
    if (cardsExist === true && finish === false) {
      setShowingCards(true);
    };
    if (cardsExist === false) {
      alert('No Cards to Study!');
    };
  };

  function handleResponse() {
    setResponse(true);
  };

  function handleAnswerAgainNew() {
    setResponse(false);
    if (failure === true) {
      setFailure(false);
    } else {
      setFailure(true);
    };

    getDbmessages();
  };

  const handleAnswerEasy = async (e) => {
    setResponse(false);
    setFailure(false);

    await setDoc(doc(db, "cards", newCards[0].id), {
      interval: firebase.firestore.FieldValue.increment(1),
      status: "ReviewCard",
      dateTime: `${currentMonth}/${currentDay + 3}/${currentYear}`,
    }, { merge: true });

    getDbmessages();
  };

  const handleAnswerNormal = async (e) => {
    setResponse(false);
    setFailure(false);

    await setDoc(doc(db, "cards", newCards[0].id), {
      interval: firebase.firestore.FieldValue.increment(1),
      status: "ReviewCard",
      dateTime: `${currentMonth}/${currentDay + 2}/${currentYear}`,
    }, { merge: true });

    getDbmessages();
  };

  const handleAnswerHard = async (e) => {
    setResponse(false);
    setFailure(false);

    await setDoc(doc(db, "cards", newCards[0].id), {
      interval: firebase.firestore.FieldValue.increment(1),
      status: "ReviewCard",
      dateTime: `${currentMonth}/${currentDay + 1}/${currentYear}`,
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

  const handleAnswerAgainReview = async (e) => {
    setResponse(false);
    if (failure === true) {
      setFailure(false);
    } else {
      setFailure(true);
    };

    await setDoc(doc(db, "cards", reviewCards[0].id), {
      interval: 0,
      dateTime: today,
    }, { merge: true });

    getDbmessages();
  };

  const handleAnswerEasyReview = async (e) => {
    setResponse(false);
    setFailure(false);

    await setDoc(doc(db, "cards", reviewCards[0].id), {
      interval: firebase.firestore.FieldValue.increment(1),
      dateTime: `${currentMonth}/${currentDay + 20}/${currentYear}`,
    }, { merge: true });

    getDbmessages();
  };

  const handleAnswerNormalReview = async (e) => {
    setResponse(false);
    setFailure(false);

    await setDoc(doc(db, "cards", reviewCards[0].id), {
      interval: firebase.firestore.FieldValue.increment(1),
      dateTime: `${currentMonth}/${currentDay + 10}/${currentYear}`,
    }, { merge: true });

    getDbmessages();
  };

  const handleAnswerHardReview = async (e) => {
    setResponse(false);
    setFailure(false);

    await setDoc(doc(db, "cards", reviewCards[0].id), {
      interval: firebase.firestore.FieldValue.increment(1),
      dateTime: `${currentMonth}/${currentDay + 5}/${currentYear}`,
    }, { merge: true });

    getDbmessages();
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
        {openModal && <Modal closeModal={setOpenModal} currentDeck={currentDeck} setStudying={setStudying} getDbmessages={getDbmessages} setFailure={setFailure}/>}
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
        <h1>New Cards ({newCardsLength}):</h1>
        {newCards.map((card) => {
          if (card.deck === currentDeck && showingCards === true) {
            return (
              <div>
                  {card.front}
              </div>
            )
          }
        })}
        <h1>Review Cards ({reviewCardsLength}):</h1>
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
        {showingCards && newCardsLength > 0 ? <>{failure && newCardsLength > 1 ? <div>{newCards[1].front}</div> : <div>{newCards[0].front}</div>}
        <div className='responses'>
        {response===true ? <>
            {failure && newCardsLength > 1 ? <div>{newCards[1].back}</div> : <div>{newCards[0].back}</div>}
            <button onClick={handleAnswerAgainNew}>Again</button>
            <button onClick={handleAnswerHard}>Hard</button>
            <button onClick={handleAnswerNormal}>Normal</button>
            <button onClick={handleAnswerEasy}>Easy</button></> : <>
            <button onClick={handleResponse}>Show Response</button>
            </>}
          </div></>
        : <div></div>}
        {showingCards && newCardsLength === 0 && reviewCardsLength > 0 ? <>{failure && reviewCardsLength > 1 ? <div>{reviewCards[1].front}</div> : <div>{reviewCards[0].front}</div>}
        <div className='responses'>
        {response===true ? <>
            {failure && reviewCardsLength > 1 ? <div>{reviewCards[1].back}</div> : <div>{reviewCards[0].back}</div>}
            <button onClick={handleAnswerAgainReview}>Again</button>
            <button onClick={handleAnswerHardReview}>Hard</button>
            <button onClick={handleAnswerNormalReview}>Normal</button>
            <button onClick={handleAnswerEasyReview}>Easy</button></> : <>
            <button onClick={handleResponse}>Show Response</button>
            </>}
          </div></>
        : <div></div>}
        {finish && cardsLength > 0 ? <div>You have finished studying for today! Come back tomorrow!</div> : <></>}
        {cardsLength === 0 ? <div>No cards in this deck yet.</div> : <></>}
    </div>
  );
}

export default Cards;