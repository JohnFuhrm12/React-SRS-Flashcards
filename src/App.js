import './App.css';
import React, {useState, useEffect, useRef} from "react";
import Decks from './Decks';
import Cards from './Cards';

import Login from './Login';
import useLocalStorage from "./useLocalStorage";

const App = () => {
  const [studying, setStudying] = useState(false);
  const [currentDeck, setCurrentDeck] = useState("none");

  const [name, setName] = useLocalStorage()

  return (
      <>
      {studying===false ? <Decks studying={studying} setStudying={setStudying} currentDeck={currentDeck} setCurrentDeck={setCurrentDeck} name={name} setName={setName} />
       : 
       <Cards studying={studying} setStudying={setStudying} currentDeck={currentDeck} setCurrentDeck={setCurrentDeck} />}
      </>
  )
}

export default App;
