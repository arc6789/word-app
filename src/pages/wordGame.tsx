import { useLocation } from 'react-router-dom';
import {useState, useEffect} from 'react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { wordGameData } from "./wordGameData";

export default function WordGame () {
    const location = useLocation();
    const {gameWordSet} = location.state || {};
    const [wordsObject, setWordsObject] = useState([])

    const getWordGameData = useQuery(api.messages.getWordGameData);
    const sendWordGameData = useMutation(api.messages.sendWordGameData);
    useEffect(() => {
      console.log("getWordGameData", getWordGameData)
      const timer = setTimeout(() => {
        const fetchWordGame = async() => {
          try {
            console.log("getWordGameData", getWordGameData)
            if(getWordGameData) {
              console.log("data", getWordGameData)
              setWordsObject(getWordGameData)
            } else {
              console.log("wordsObject", wordsObject)
              await sendWordGameData({words: wordGameData})
            }
          } catch(error) {
            console.log("error", error)
          }
        }
        console.log("getWordGameData", getWordGameData)
        fetchWordGame()
      }, 1000)

      return () => clearTimeout(timer);
    },[])

    return (
      <div>
          I am a new game!
          {wordsObject.map((word)=> {
            return (
              <img src={word.image}></img>
            )
          })}

      </div>
    )
}
