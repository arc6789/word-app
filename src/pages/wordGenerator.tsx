import {useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "../components/ui/button";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { 
    Card,
    CardContent,
} from "../components/ui/card";

// should be moved to app.TSX
// save to the words variable and move to main tsx and pass it through the component
export default function Word () {
    const [wordsOfTheDay, setWordsOfTheDay] = useState({
        sentence: null,
        words: [],
    })
    const [gameWordSet, setgameWordSet] = useState({
        word:null,
        image: null,
        guessed: false
    })
    const [speakerOn, setSpeakerOn] = useState(false)
    const getWords = useAction(api.openai.getWords);


    useEffect(() => {
        const timer = setTimeout(() => {
            const fetchWords = async () => {
                try {
                    const wordData = await getWords();
                    console.log(wordData, "a")
                    const gameData = wordData[0].words.map((word) => {
                        return {
                            word: word.word,
                            image: word.image,
                            guessed: word.pronounced
                        }
                    })
                    setWordsOfTheDay(wordData[0]);
                    setgameWordSet(gameData)
                    console.log("dat:", wordData);
                    console.log("game", gameData)
                } catch(error) {
                    console.log(error);
                }
            };
            fetchWords();
        }, 1000); // Delay set to 1 seconds (1000 milliseconds)

        return () => clearTimeout(timer);
    }, []);

    const textToSpeech = (word) => {
        if ('speechSynthesis' in window) {
            var msg = new SpeechSynthesisUtterance();
            msg.text = word;
            msg.lang = 'en-US';
        
            // Uncomment these lines to customize voice and speech parameters
            // msg.voice = speechSynthesis.getVoices().filter(voice => voice.name == "Google US English")[0];
            // msg.volume = 1;
            // msg.rate = 1;
            // msg.pitch = 2;
        
            msg.onstart = function(event) {
                setSpeakerOn(true)
            };
        
            msg.onend = function(event) {
                setSpeakerOn(false)
            };
        
            msg.onerror = function(event) {
                console.log('Speech error');
            };
        
            window.speechSynthesis.speak(msg);
        } else {
            alert("Sorry, your browser does not support text to speech!");
        }
    }
    const navigate = useNavigate();

    const handleButtonClick = () => {
        console.log(gameWordSet)
        navigate('/wordGame', { state: { gameWordSet } });
    };

    return (
        <div className="word-grid">
            <div className="grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-2pm gap-5 m-[50px]">
                {wordsOfTheDay && wordsOfTheDay.words.map(wordObj => {
                    return (
                    <Card key={wordObj.word} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <CardContent className="p-2 max-h-full">
                            <div className="table text-left pb-[5px] w-full">
                                <span className="inline float-left">{wordObj.word}</span>
                                <VolumeUpIcon 
                                    className={`inline float-left m-[3px] ${speakerOn ? "bg-cyan-400" : ""}`}
                                    fontSize="small"
                                    onClick={() => {textToSpeech(wordObj.word)}}>
                                </VolumeUpIcon>
                                <CallMadeIcon
                                    className="inline float-right color-[#9e9c9c] m-[3px]"
                                    fontSize="small"
                                    onClick={() => {}}
                                ></CallMadeIcon>
                            </div>
                            <div className="block max-w-full h-auto">
                                {wordObj.image 
                                    ? <img src={wordObj.image} className="m-auto pb-[10px]"></img>
                                    : <div className="bg-[#50d71e] max-w-full h-auto"></div>
                                }   
                            </div>
                            {wordObj.definition &&
                                <div className="text-left text-strong">
                                    <h3>Definition</h3>
                                    <ol className="list-decimal">
                                        {wordObj.definition.map((def, index) => {
                                            return (
                                                <li key={index} className="mb-2 pb-[5px] text-xs ml-[15px]">
                                                    {def[0].toUpperCase() + def.slice(1)}
                                                </li>
                                            )
                                        })}
                                    </ol>
                                </div>
                            }
                            {wordObj.example.length !== 0 &&  
                                <div className="text-left text-strong">
                                    <h3> Example Usage </h3>
                                    <ol className="list-decimal">
                                        {wordObj.example.map((ex, index) => {
                                            return (
                                                <li key={index} className="mb-2 pb-[5px] text-xs ml-[15px]">
                                                    <span dangerouslySetInnerHTML={{ __html: ex }}></span>
                                                </li>
                                            )
                                        })}
                                    </ol>
                                </div>
                            }
                        </CardContent>
                    </Card>
                )})}
            </div>
            <div>
                <Link to="/wordGame" state={{gameWords: gameWordSet}}>
                    <Button> Lets play a game!</Button>
                </Link>
                <Button  onClick={handleButtonClick}>Lets play!</Button>
            </div>
        </div>
    )
}