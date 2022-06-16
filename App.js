import './App.css';
import React, {useState, useEffect, useRef} from "react";
import Decks from './Decks';
import Cards from './Cards';

const App = () => {
  const [studying, setStudying] = useState(false);
  const [currentDeck, setCurrentDeck] = useState("none");

  return (
      <>
      {studying===false ? <Decks studying={studying} setStudying={setStudying} currentDeck={currentDeck} setCurrentDeck={setCurrentDeck} />
       : 
       <Cards studying={studying} setStudying={setStudying} currentDeck={currentDeck} setCurrentDeck={setCurrentDeck} />}
      </>
  )
}

export default App;
