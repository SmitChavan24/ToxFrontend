import { useState } from "react";
import axios from "axios";
import EmojiPicker from "emoji-picker-react"; // install this package

const EmojiGifBox = ({ onGifSend, onEmojiSelect }) => {
    const [sTerm, setSearchTerm] = useState("");
    const [gifResults, setGifResults] = useState([]);
    const [showPicker, setShowPicker] = useState(false);
    const [showGifBox, setShowGifBox] = useState(false);

    const API_KEY = import.meta.env.VITE_GIF_KEY;

    const searchGIFs = async (searchTerm) => {
        setSearchTerm(searchTerm)
        if (!searchTerm.trim()) return;

        const SEARCHGIF = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=dawai&limit=${10}`
        const SEARCHSTICK = `https://api.giphy.com/v1/stickers/search?api_key=${API_KEY}&q=${searchTerm}&limit=${20}`
        const URLGIF = `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=${20}`
        const URLSTICK = `https://api.giphy.com/v1/stickers/trending?api_key=${API_KEY}&limit=${20}`

        const Gifresponse = await axios.get(SEARCHSTICK)
        const gifs = Gifresponse.data.data;
        setGifResults(gifs);
    };

    return (
        <div className="relative w-full">
            {/* Toggle Buttons */}
            <div className="flex gap-2 mb-2">
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="px-2 py-1 bg-yellow-400 rounded text-sm"
                >
                    😀 Emoji
                </button>
                <button
                    onClick={() => setShowGifBox(!showGifBox)}
                    className="px-2 py-1 bg-pink-400 rounded text-sm"
                >
                    🎬 GIF
                </button>
            </div>

            {/* Emoji Picker */}
            {showPicker && (
                <div className="absolute z-50 bottom-16">
                    <EmojiPicker
                        onEmojiClick={(emojiData) => {
                            onEmojiSelect(emojiData.emoji);
                        }}
                        reactionsDefaultOpen={true}
                        height={350}
                        width={300}
                    />
                </div>
            )}

            {/* GIF Search Box */}
            {showGifBox && (
                <div className="p-3 border rounded-md bg-white shadow max-h-80 overflow-y-auto space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={sTerm}
                            onChange={(e) => searchGIFs(e.target.value)}
                            placeholder="Search GIFs..."
                            className="border px-2 py-1 flex-1 rounded"
                        />
                        {/* <button
                            onClick={searchGIFs}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                            Search
                        </button> */}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                        {gifResults.map((gif) => (
                            <img
                                key={gif.id}
                                src={gif.images.fixed_height_small.url}
                                alt="gif"
                                className="w-full h-auto cursor-pointer rounded hover:scale-105 transition-transform"
                                onClick={() => {
                                    onGifSend(gif.images.fixed_height_small.url);
                                    setShowGifBox(false); // auto-close on send
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmojiGifBox;
