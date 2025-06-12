import React from 'react'
import Webcam from 'react-webcam';
import FaceDetection from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';




const Captureface = () => {
    // const { faces, isLoading, error, videoRef } = useFaceDetection();

    // if (isLoading) {
    //     return <p>Loading...</p>;
    // }

    // if (error) {
    //     return <p>Error: {error.message}</p>;
    // }

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };
    return (
        <Webcam
            audio={false}
            height={720}
            screenshotFormat="image/jpeg"
            width={1280}
            videoConstraints={videoConstraints}
        >
            {({ getScreenshot }) => (
                <button
                    onClick={() => {
                        const imageSrc = getScreenshot()
                        console.log(imageSrc)
                    }}
                >
                    Capture photo
                </button>
            )}
        </Webcam>
    )
}

export default Captureface