'use client';

// import { Flex } from "@chakra-ui/react";
import { FC, useState, useRef } from 'react';

import { Box, AspectRatio, Flex } from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

interface Props {
  url: string;
  width?: string;
  preview?: boolean;
  overlay?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
}
const VideoPlayer: FC<Props> = ({
  url,
  width,
  preview = false,
  overlay = false,
  loop = false,
  autoPlay = false
}) => {
  const [hovering, setHovering] = useState(false);
  const [muted, setMuted] = useState(preview);
  const [playing, setPlaying] = useState(autoPlay);

  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = () => {
    videoRef.current?.play();
    setPlaying(true);
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };

  if (url) {
    return (
      <Box
        width={width ? width : 'full'}
        position={'relative'}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <AspectRatio ratio={16 / 9}>
          <video
            ref={videoRef}
            className="rounded-md"
            style={{
              display: 'block', // To remove any default whitespace
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: 'black'
            }}
            controls={!preview}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
          >
            <source src={url} type="video/mp4" />
          </video>
        </AspectRatio>
        {overlay && hovering && (
          <Flex
            w="full"
            h="full"
            position={'absolute'}
            top={0}
            left={0}
            justifyContent={'center'}
            alignItems={'center'}
            color="white"
          >
            <Flex
              bg="whiteAlpha.600"
              rounded="full"
              fontSize="4xl"
              p={4}
              cursor={'pointer'}
              onClick={() => setMuted(!muted)}
            >
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
            </Flex>
            <Flex
              position="absolute"
              bottom={4}
              left={4}
              fontSize="xl"
              cursor={'pointer'}
              onClick={playing ? pauseVideo : playVideo}
            >
              {playing ? <FaPause /> : <FaPlay />}
            </Flex>
          </Flex>
        )}
      </Box>
    );
  }
};

export default VideoPlayer;
