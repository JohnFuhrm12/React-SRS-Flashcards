import './App.css';
import React, {useState, useEffect} from "react";
import Modal from './Modal';
import DeleteDeckModal from './DeleteDeckModal';

// Firebase imports
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, limit } from "firebase/firestore";

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

const Cards = ( {setStudying, currentDeck}) => {
  // Set the current cards and decks
  const [cards, setCards] = useState([]);
  const [decks, setDecks] = useState([]);

  // Toggle open and closings Modals
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // Check if there are cards for current deck
  const [cardsExist, setCardsExist] = useState(false);
  const [newCardsExist, setNewCardsExist] = useState(false);

  // Refer to decks, check if user pressed Again response (to only change to another card)
  const decksRef = db.collection('decks');
  const [failure, setFailure] = useState(false);

  // Checl for toggling showing cards to study and when to respond/show answer
  const [showingCards, setShowingCards] = useState(false);
  const [response, setResponse] = useState(false);

  // Refer to and set New and Review Cards, check if session finished (no cards in queue)
  const [newCards, setNewCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);
  const [finish, setFinish] = useState(false);

  let cardsLength = cards.length;
  let newCardsLength = newCards.length;
  let reviewCardsLength = reviewCards.length;

  // Get Current Date in an easy to change format for the algorithm
  let today = new Date().toLocaleDateString();
  const currentMonth = Number(today.split(/[/]/)[0]);
  const currentDay = Number(today.split(/[/]/)[1]);
  const currentYear = Number(today.split(/[/]/)[2]);

  // Refer to the Decks and Cards in the DB
  const decksRef2 = collection(db, "decks");
  const cardsRef2 = collection(db, "cards");

  // Used as a function to refresh cards when the DB changes, grabs all decks and cards for the deck and limits them to 20 (New Cards) and 50 (Review Cards)
  // This way the user is not overwhelmed with cards to study
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

  // Same as above, grab newest version of database on page load as well as updates new cards for today's date
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
    updateReview();

    }, []);

    // Keep checking if there are cards in queue (Changes display message)
    useEffect(() => {
      DoCardsExist();
      FinishSession();
    });

    // If no cards left, display a message
    function FinishSession() {
      if (newCardsLength === 0 && reviewCardsLength === 0) {
        setFinish(true);
      } else {
        setFinish(false);
      };
    };

    // Sets all New Cards to current Date
    const getDateTime = async (e) => {
      const allNew = query(cardsRef2, where('status', '==', 'NewCard'));
      const newSnapshot = await getDocs(allNew);
      newSnapshot.forEach((docu) => {
        setDoc(doc(db, "cards", docu.id), {
          dateTime: today,
        }, { merge: true });
      });
    };

    // Sets all Review Cards Before Current Date To Current Date
    const updateReview = async (e) => {
      const allReview = query(cardsRef2, where('status', '==', 'ReviewCard'), where('dateTime', '<', today));
      const reviewSnapshot = await getDocs(allReview);
      reviewSnapshot.forEach((docu) => {
        setDoc(doc(db, "cards", docu.id), {
          dateTime: today,
        }, { merge: true });
      });
    };

    // Open Add Cards Modal Screen
    function open() {
      setOpenModal(true);
    };

    // Open Delete Deck Modal Screen
    function openDelete() {
      setOpenDeleteModal(true);
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

  // Show cards or display messages
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

  // Toggle show answer
  function handleResponse() {
    setResponse(true);
  };

  // Check if there are cards
  function DoCardsExist() {
    if (cardsLength > 0) {
      setCardsExist(true);
    };
    if (newCardsLength > 0) {
      setNewCardsExist(true);
    };
  };

  // Everything below this point is the Algorithm that handles all the study responses
  // All the Algorithm does is depending on the user's response it will change the cards date to when they will see it next
  // Checks are made to how early or late in the month it is to prevent changing the date to a date that doesn't exist (Ex: 6/43/2022)
  // The interval determines how long each response changes the date, it's increased each time a card is remembered 

  // If again is pressed, change to the second card
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
    {openDeleteModal && <DeleteDeckModal currentDeck={currentDeck} deleteDeck={deleteDeck} closeDeleteModal={setOpenDeleteModal} setStudying={setStudying} getDbmessages={getDbmessages} setFailure={setFailure}/>}
        <h1 className='currentTitle'>{currentDeck}</h1>
        <div className='topRowCards'>
          <button className='ReturnDecksButton' onClick={back}>Decks</button>
          <button className='StudyButton' onClick={showCards}>Study</button>
          <button className='DeleteDeckButton' onClick={openDelete}>Delete Deck</button>
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