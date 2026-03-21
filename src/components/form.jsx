import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react';
const Form = () => {
    // const [Num, setNum] = useState(0);
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [task, setTask] = useState([]);
    useEffect(() => { 
        const storedTasks = localStorage.getItem('notes');
        if (storedTasks) {
            setTask(storedTasks);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('notes',task);
    }, [task]);

    function autosub(e) {
        e.preventDefault();

        const newCopy = [...task];
        newCopy.push({ title, details });
        // console.log(newCopy)
        setTask(newCopy);
        console.log(newCopy)

        setTitle('');
        setDetails('');
    }
    const deleteNote = (idx) => {
        const newCopy = [...task]

        newCopy.splice(idx, 1);
        setTask(newCopy)
    }

    return (
        <div className='relative flex sm:flex-row z-40'>
            <form id='Form' className='lg:w-3/4 h-screen flex lg:py-12   lg:px-30  z-20  bg-black ' onSubmit={(e) => { autosub(e); }}>
                <div className='rounded-xl w-full  bg-black'>
                    <h2 className='text-6xl font-bold font-serif flex justify-center bg-amber-100  p-2 rounded-2xl underline decoration-purple-200 '>Write notes</h2>
                    <div className='flex flex-col gap-2 mt-8  p-2 rounded-2xl shadow-lg  bg-amber-100 '>
                        <input type="text" className=' py-1 outline-none px-1 w-full border-4 border-amber-150 rounded ' placeholder='Title'
                            value={title} onChange={(e) => {
                                setTitle(e.target.value);
                            }} />
                        <textarea className=' border-4 outline-none  h-[40vh] px-1 w-full rounded resize-none' placeholder='describe...'
                            value={details}
                            onChange={(e) => {
                                setDetails(e.target.value)
                            }} />
                        <button className='rounded py-2 px-1 w-full text-purple-900 bg-eeba0b shadow-sm font-bold active:bg-amber-50 active:scale-98 hover:bg-white/95  hover:transition-transform hover:scale-101 hover:transition:300 font-serif '>Add note</button>
                    </div>
                </div >

            </form>

            <div className='bg-black w-1/4 h-screen sm:w-1/4 sm:text-xl font-medium  overflow-auto'>
                <h2 id='navbar' className='sticky top-0 z-10 bg-black underline border-1 border-black  backdrop-blur-8xl text-white   flex justify-around text-4xl py-12  decoration decoration-purple-400 '>All notes</h2>

                <div className='flex flex-wrap lg:flex-row  gap-2 rounded-2xl lg:p-6  mt-10  overflow-auto '>
                    {task.map(function (elem, idx) {

                        return (
                            <div key={idx} className='flex flex-col contain-content gap-1 w-full sm:w-full sm:h-28 rounded-2xl  border-none py-1 px-2 text-yellow-600 shadow-amber-90 hover:shadow-sm font-medium text-xs bg-amber-100 hover:transition-transform hover:scale-101 hover:transition:300 overflow-y-auto max-h-32'>
                               <button className=' text-red-400 bg-red-400 h-4 rounded-full  hover:text-white hover:bg-red-600  w-fit transition-transform transform-300 ' onClick={
                                    () => {
                                        deleteNote(idx);
                                    }
                                }><X size={16} />
                              </button> 
                                {/* <h2 className=' text-yellow-600 w-4 h-4 rounded-full  hover:text-white bg-yellow-600  transition-transform transform-300'>   <X size={16} /></h2>
                                <h2 className=' text-green-600 w-4 h-4 rounded-full  hover:text-white bg-green-600  transition-transform transform-300'>   <X size={16} /></h2> */}

                                <h3 className='text-sm font-bold text-amber-700'> {elem.title}</h3>

                                <h4 className='text-xs leading-tight overflow-y-auto max-h-20 pr-1'>{elem.details}</h4>
                            </div>

                        )

                    }
                    )}

                    {/* <Num /> */}


                </div>
            </div>

        </div>
    )
}


export default Form
