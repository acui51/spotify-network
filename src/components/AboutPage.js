import React, { useState, useContext } from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const AboutPage = ({
}) => {

    return (
            <div className='relative w-3/4'>
                <div className="ml-60 h-80 flex flex-col absolute mt-8 py-2 px-8 justify-center items-center bg-white rounded border-gray border-x-2">
                    <div className="text-2xl pt-6 pb-1">
                        <span className="text-2xl ">Data and Methods </span>
                    </div>
                    <p>
                        This tool does blah blah blah
                    </p>

                    <button
                        className={
                            "bg-green-500 w-20 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                        }
                        onClick={() => {
                            handleClose()
                        }}
                    >Next</button>
                </div>
            </div>
    );
};

export default AboutPage;