import './App.css';
import React, {useState, useEffect, useRef} from "react";
import Decks from './Decks';
import Cards from './Cards';

const App = () => {
  const [studying, setStudying] = useState("");

  return (
      <>
      {studying}
      {studying==="" ? <Decks studying={studying} setStudying={setStudying} /> : <Cards studying={studying} setStudying={setStudying}/>}
      </>
  )
}

export default App;
