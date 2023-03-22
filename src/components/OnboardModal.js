import React, { useState, useContext } from "react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import onboard1 from './onboard1.png'
// import onboard2 from './onboard2.png'
// import onboard3 from './onboard3.png'

const OnboardModal = ({
    visible,
    onCancel,
    onOk,
    toggleModal,
}) => {
    const [page1, setPage1] = useState(true)
    const [page2, setPage2] = useState(false)
    const [page3, setPage3] = useState(false)
    const [nextButton1, setNextButton1] = useState(false)
    const [nextButton2, setNextButton2] = useState(false)
    const [nextButton3, setNextButton3] = useState(false)
    const [open, setOpen] = useState(true);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Modal
            open={open}
            onClose={handleClose}
        >
            <div className='relative w-3/4'>
                <div className="ml-60 flex flex-col absolute mt-8 py-2 px-8 justify-center items-center bg-white rounded border-gray border-x-2">
                    <div className="text-2xl pt-6 pb-1">
                        <span className="text-2xl ">Hi! Welcome to our Playlist Similiarity Explorer </span>
                    </div>
                    {page1 ? <img className=" h-1/2 py-4" src='/onboard1.png'></img> : null}
                    {page2 ? <img className=" h-1/2 py-4" src='/onboard2.png'></img> : null}
                    {page3 ? <img className=" h-1/2 py-4" src='/onboard3.png'></img> : null}
                    <button
                        className={
                            "bg-green-500 w-20 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                        }
                        onClick={() => {
                            if (page1) {
                                setPage1(false)
                                setPage2(true)
                            }
                            else if (page2) {
                                setPage2(false)
                                setPage3(true)
                            }
                            else if (page3) {
                                setPage3(false)
                                handleClose()
                            }
                        }}
                    >Next</button>
                </div>
            </div>
        </Modal>
    );
};

export default OnboardModal;