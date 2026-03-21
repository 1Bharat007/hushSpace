import React from 'react'
import Allthings from './all-the-things.png'
import Card from './card'
import FlowerOnTop from './IMG_3884.jpg'
import Meadows from './IMG_3944.jpg'
import RoofKabutar from './IMG_20251008_173602.jpg'
import StreetLightKabutar from './1000162121.jpg'
import Roof from './IMG-20240902-WA0003.jpg'
import Nature from './IMG-20250418-WA0064.jpg'
import StreetSnow from './IMG-20250227-WA0165.jpg' 


const Page1 = () => {

  return (

<div className='h-[100vh] relative bg-black'>


  <h1 className='text-6xl sticky font-bold text-white flex justify-center items-center top-0 mb-50 '>Pictures</h1>
  <div className='h-screen flex-wrap items-center justify-center bg-black shadow-2xl overflow-x-scroll scrollbar-hide relative py-5 ' >
     <div className='translate-x-1/3 w-full flex gap-54 h-1/2 p-2 animate-loop'>  

               {/* <video 
               src="https://sixtep.com/sixtep-screenrecord.mp4" 
                className=' justify-center  h-[70vh] border-6 border-b-black rounded-4xl'
                autoPlay
                loop
          >
               </video> */}
               {/* <Card user=""></Card> */}
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={StreetLightKabutar} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={Nature} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={StreetSnow} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={RoofKabutar} alt="" /> 
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={Meadows} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl hover:scale-105 ease-out duration-300  relative  ' src={FlowerOnTop} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={RoofKabutar} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={Roof} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={StreetLightKabutar} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={Meadows} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={StreetLightKabutar} alt="" />
        <img className='w-xl border-white border-16 shadow-2xl rounded-4xl  hover:scale-105 ease-out duration-300  relative ' src={FlowerOnTop} alt="" />

</div >
<img src="{Allthings}" alt="" />
      
    </div> 
    </div>
  )
}

export default Page1
