import React, { useState, useContext } from "react";
import Modal from "@mui/material/Modal";

const AboutModal = ({ visible }) => {
  const [open, setOpen] = useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="relative w-3/4">
        <div className="ml-60 flex flex-col absolute mt-8 py-2 px-8 justify-center items-center bg-white rounded border-gray border-x-2">
          <div className="py-6">
            <button
              onClick={() => visible(false)}
              className="w-10 bg-red-700 text-white font-bold py-1 px-2 top-2 right-3 absolute rounded"
            >
              {" "}
              x{" "}
            </button>
            <h1 className="py-1 font-bold"> DATA AND METHOD </h1>
            <div className="">
              {" "}
              In this interface we present a graphical representation of song
              similarity using the Spotify API. We obtained the audio feature
              data for our project from the Spotify Web API. To access this
              data, we required users to log in and authorize our application to
              access their public playlists using the OAuth 2.0 authentication
              protocol. This allowed us to retrieve information about the tracks
              in their playlists, including their audio features, such as tempo,
              key, mode, and danceability.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;
