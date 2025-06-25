import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";
import {
    Card,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "../../components/ui/button";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import axios from "axios";
const env = await import.meta.env;

// const socket = io("http://localhost:3000");

const ChatPage = ({ socket }) => {
    const [message, setMessage] = useState("");
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();


    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }
    // const [messages, setMessages] = useState([]);

    // useEffect(() => {
    //     socket.on("messageResponse", (data) => setMessages([...messages, data]));
    // }, [socket, messages]);

    const CallGif = async (gif) => {
        const API_KEY = import.meta.env.VITE_GIF_KEY;
        // console.log(API_KEY)
        const SEARCHGIF = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=dawai&limit=${10}`
        const SEARCHSTICK = `https://api.giphy.com/v1/stickers/search?api_key=${API_KEY}&q=dawai&limit=${10}`
        const URLGIF = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${20}`
        const URLSTICK = `https://api.giphy.com/v1/stickers/trending?api_key=${API_KEY}&limit=${20}`

        const Gifresponse = await axios.get(SEARCHSTICK)
        console.log(Gifresponse)


    }

    const handleSendMessage = (e) => {
        // e.preventDefault();
        console.log(message)
        socket.emit("message", {
            text: message,
            name: "smit",
            id: `${socket.id}${Math.random()}`,
            socketID: socket.id,
        });

        setMessage("");
    };

    return (
        <Card className="@container/cards bg-gray-100">
            <p>Microphone: {listening ? 'on' : 'off'}</p>
            {/* <!-- Incoming message --> */}
            <div class="flex items-start">
                <div class="bg-white text-gray-800 px-4 py-2 rounded-lg rounded-bl-none shadow">
                    {transcript}
                </div>
            </div>

            {/* <!-- Outgoing message --> */}
            {/* <div class="flex justify-end">
                <div class="bg-blue-500 text-white px-4 py-2 rounded-lg rounded-br-none shadow">
                    I'm good! You?
                </div>
            </div> */}

            <Button onClick={() => SpeechRecognition.startListening({ continuous: true })}>Start</Button>
            <Button onClick={SpeechRecognition.stopListening}>Stop</Button>
            <Button onClick={resetTranscript}>Reset</Button>
            <Button onClick={CallGif}>CallGif</Button>
            <Input type="text" placeholder="Type Message" />
        </Card>

    );
};

export default ChatPage;
