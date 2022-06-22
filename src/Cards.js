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
    if (finish === true && cardsExist === true) {
      alert('You have finished studying for today! Come back tomorrow!');
    };
    if (showingCards === true) {
      setShowingCards(false);
    }
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
      interval: 1,
      dateTime: today,
    }, { merge: true });

    getDbmessages();
  };

  const handleAnswerEasyReview = async (e) => {
    setResponse(false);
    setFailure(false);

    if (reviewCards[0].interval === 1 && currentDay < 23) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 8}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 1 && currentDay >= 23) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay - 22}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 2 && currentDay < 11) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 15}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 2 && currentDay >= 11) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay -10}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 3) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval > 3) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 2}/${currentDay}/${currentYear}`,
      }, { merge: true });
    };

    getDbmessages();
  };

  const handleAnswerNormalReview = async (e) => {
    setResponse(false);
    setFailure(false);

    if (reviewCards[0].interval === 1 && currentDay < 26) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 5}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 1 && currentDay >= 26) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay - 25}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 2 && currentDay < 21) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 10}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 2 && currentDay >= 21) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay - 20}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 3 && currentDay < 11) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 20}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 3 && currentDay >= 11) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay - 10}/${currentYear}`,
      }, { merge: true });
    }

    if (reviewCards[0].interval > 3) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay}/${currentYear}`,
      }, { merge: true });
    };

    getDbmessages();
  };

  const handleAnswerHardReview = async (e) => {
    setResponse(false);
    setFailure(false);

    if (reviewCards[0].interval === 1 && currentDay < 27) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 3}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 1 && currentDay >= 27) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay - 26}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 2 && currentDay < 24) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 6}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 2 && currentDay >= 24) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay - 23}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 3 && currentDay < 17) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 12}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval === 3 && currentDay >= 17) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay - 16}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval > 3 && currentDay < 6) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth}/${currentDay + 24}/${currentYear}`,
      }, { merge: true });
    };

    if (reviewCards[0].interval > 3 && currentDay >= 6) {
      await setDoc(doc(db, "cards", reviewCards[0].id), {
        interval: firebase.firestore.FieldValue.increment(1),
        dateTime: `${currentMonth + 1}/${currentDay - 5}/${currentYear}`,
      }, { merge: true });
    };

    getDbmessages();
  };

  return (
    <>
    <div className='page'>
    {openModal && <Modal closeModal={setOpenModal} currentDeck={currentDeck} setStudying={setStudying} getDbmessages={getDbmessages} setFailure={setFailure}/>}
        <h1 className='currentTitle'>{currentDeck}</h1>
        <div className='topRowCards'>
          <button className='ReturnDecksButton' onClick={back}>Decks</button>
          <button className='StudyButton' onClick={showCards}>Study</button>
          <button className='DeleteDeckButton' onClick={deleteDeck}>Delete Deck</button>
        </div>
        <div className='addRow'>
            <button className='AddCardButton' onClick={open}>Add Card</button>
        </div>
        {showingCards && newCardsLength > 0 ? <>{failure && newCardsLength > 1 ? <h1 className='cardName'>{newCards[1].front}</h1> : <h1 className='cardName'>{newCards[0].front}</h1>}
        <div className='responses'>
        {response===true ? <>
            {failure && newCardsLength > 1 ? <h1 className='cardNameAnswer'>{newCards[1].back}</h1> : <h1 className='cardNameAnswer'>{newCards[0].back}</h1>}
            <div className='cardCounters'>
              <p className='newCardsCounter'>{newCardsLength}</p>
              <p className='reviewCardsCounter'>{reviewCardsLength}</p>
            </div>
            <button className='choicesButton' onClick={handleAnswerAgainNew}>Again</button>
            <button className='choicesButton' onClick={handleAnswerHard}>Hard</button>
            <button className='choicesButton' onClick={handleAnswerNormal}>Normal</button>
            <button className='choicesButton' onClick={handleAnswerEasy}>Easy</button></> : <>
            <div className='cardCountersBefore'>
              <p className='newCardsCounter'>{newCardsLength}</p>
              <p className='reviewCardsCounter'>{reviewCardsLength}</p>
            </div>
            <button className='responseButton' onClick={handleResponse}>Show Response</button>
            </>}
          </div></>
        : <div></div>}
        {showingCards && newCardsLength === 0 && reviewCardsLength > 0 ? <>{failure && reviewCardsLength > 1 ? <h1 className='cardName'>{reviewCards[1].front}</h1> : <h1 className='cardName'>{reviewCards[0].front}</h1>}
        <div className='responses'>
        {response===true ? <>
            {failure && reviewCardsLength > 1 ? <h1 className='cardNameAnswer'>{reviewCards[1].back}</h1> : <h1 className='cardNameAnswer'>{reviewCards[0].back}</h1>}
            <div className='cardCounters'>
              <p className='newCardsCounter'>{newCardsLength}</p>
              <p className='reviewCardsCounter'>{reviewCardsLength}</p>
            </div>
            <button className='choicesButton' onClick={handleAnswerAgainReview}>Again</button>
            <button className='choicesButton' onClick={handleAnswerHardReview}>Hard</button>
            <button className='choicesButton' onClick={handleAnswerNormalReview}>Normal</button>
            <button className='choicesButton' onClick={handleAnswerEasyReview}>Easy</button></> : <>
            <div className='cardCountersBefore'>
              <p className='newCardsCounter'>{newCardsLength}</p>
              <p className='reviewCardsCounter'>{reviewCardsLength}</p>
            </div>
            <button className='responseButton' onClick={handleResponse}>Show Response</button>
            </>}
          </div></>
        : <div></div>}
        {finish && cardsLength > 0 ? <p className='finishMessage'>You have finished studying for today! Come back tomorrow!</p> : <></>}
        {cardsLength === 0 ? <p className='noCardsMessage'>No cards in this deck yet.</p> : <></>}
    </div>
    </>
  );
}

export default Cards;