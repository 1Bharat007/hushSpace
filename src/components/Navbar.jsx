import React from 'react'
// import { Download } from 'lucide-react'
import Download from './download.jpeg';


const Navbar = () => {
    
    return (
        
        <div className='flex justify-center p-8  bg-black'>
        <div className='fixed flex justify-center h-[6vh] w-6/10 bg-white/10 shadow-2xl  rounded-2xl  z-10 border-1 border-black'>

<div className='flex items-center justify-around p-3 w-full'>
    


         
                   
                   
                    <img src={Download} className='h-[5vh] rounded-full shadow-2xl  mr-70' alt="" />


<div className='flex justify-around items-center  w-1/2 gap-6'>

                <a href="form.jsx"
                    className="font-bold font-mono text-sm relative hover:transition-all hover:duration-700 hover:ease-in-out hover:scale-105 text-violet-500"

                >
                    Write-notes

                </a>
                <a href="Page3.jsx"
                    className="font-bold font-mono text-sm relative hover:transition-all hover:duration-700 hover:ease-in-out hover:scale-105 text-blue-500"

                >Add-Pictures</a>
                <a href="Page1.jsx"
                    className="font-bold font-mono text-sm relative hover:transition-all hover:duration-700 hover:ease-in-out hover:scale-105 text-blue-600"
                >Add-Videos</a>
                <a
                    href="Page2.jsx"
                    className="font-bold font-mono text-sm relative hover:transition-all hover:duration-700 hover:ease-in-out hover:scale-105 text-white "
                >
                    About-us
                    {/* <Download /> */}
                </a>
</div>
         
</div>


        </div>
        </div>
    )
}

export default Navbar
