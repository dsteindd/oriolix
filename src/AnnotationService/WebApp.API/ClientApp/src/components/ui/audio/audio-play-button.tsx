import React, {useEffect, useRef, useState} from "react";
import {Pause, PlayArrow} from "@mui/icons-material";
import {Checkbox} from "@mui/material";

type AudioPlayButtonProps = {
    from?: number
    to?: number,
    src: string,
    listenInterval?: number,
    onListen?: (currentTime: number) => void
}


export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
                                                                    from,
                                                                    to,
                                                                    src,
                                                                    listenInterval = 100,
                                                                    onListen
                                                                }) => {

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(from ?? 0);

    const intervalRef = useRef<NodeJS.Timer>();
    const audioRef = useRef<HTMLAudioElement>(null);

    const startPlaying = async () => {
        intervalRef.current = setInterval(() => {
            setCurrentTime(audioRef.current!.currentTime);
        }, listenInterval)
        await audioRef.current!.play();
        setIsPlaying(true)
    }

    const pausePlaying = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        audioRef.current!.pause();
        setIsPlaying(false);
    }

    const resetPlayer = () => {
        pausePlaying();
        audioRef.current!.currentTime = from ?? 0;
        setCurrentTime(from ?? 0);
    }

    useEffect(() => {

        onListen && onListen(currentTime)

        if ((to && currentTime > to) || (currentTime >= audioRef.current!.duration)) {
            resetPlayer()
        }
    }, [currentTime, onListen, to])

    useEffect(() => {
        audioRef.current!.currentTime = currentTime;

        const handleKeyUp = async (e: KeyboardEvent) => {
            if (e.key == " " && !audioRef.current!.paused) {
                pausePlaying()
            } else if (e.key == " " && audioRef.current!.paused) {
                await startPlaying()
            }
        }
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key == "ArrowLeft" && audioRef.current!.paused) {
                e.stopPropagation();
                e.preventDefault();
                setCurrentTime((currentTime) => {
                    const diff = !!to && !!from ? (to - from) * 0.005 : 0.1;

                    audioRef.current!.currentTime = currentTime - diff;
                    return currentTime - diff;
                })
            } else if (e.key == "ArrowRight" && audioRef.current!.paused) {
                e.stopPropagation();
                e.preventDefault();
                setCurrentTime((currentTime) => {
                    const diff = !!to && !!from ? (to - from) * 0.005 : 0.1;

                    audioRef.current!.currentTime = currentTime + diff;
                    return currentTime + diff;
                })
            }
        }


        const disableSpaceScroll = (e: KeyboardEvent) => {
            if (e.key === " ") {
                e.stopPropagation();
                e.preventDefault();
            }
        }

        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("keypress", disableSpaceScroll)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            if (audioRef.current) {
                audioRef.current!.pause();
            }
            document.removeEventListener("keyup", handleKeyUp)
            document.addEventListener("keydown", handleKeyDown)
            document.removeEventListener("keypress", disableSpaceScroll)

        }
    }, [])

    useEffect(() => {
        setCurrentTime(from ?? 0);
        resetPlayer();

    }, [from])
    
    return (
        <>
            <audio
                ref={audioRef}
                src={src}
            />
            <Checkbox
                icon={<PlayArrow/>}
                checkedIcon={<Pause/>}
                onClick={() => isPlaying ? pausePlaying() : startPlaying()}
                checked={isPlaying}
            />
        </>
    )
}