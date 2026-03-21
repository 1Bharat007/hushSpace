import React from "react";
import Downld from "./download.jpeg"
import Card from "./card";

const Page = () => {
  return (


    <div className="h-[300vh] relative  bg-black ">

      <div className="fixed flex justify-center items-center bg-black  overflow-hidden ">
        <div className="overflow-hidden whitespace-nowrap bg-black ">
          <h1 className="text-[20vw]  font-bold  text-purple-400 bg-black  animate-loop ">
            Alive<span className="text-purple-200">ness</span>   Alive<span className="text-purple-200">ness</span> 
          </h1>
        </div>

       
      </div>

{/*  page 2 */}



<section className="h-screen relative flex justify-center bg-black items-center">

      <div className=" w-3/4  bg-black rounded-4xl  px-20 shadow-2xl ">
        <h1 className=" text-[10vw] text-gray-700 font-sans font-extrabold transition-transform duration-300 ease-in-out">
          <span className="text-gray-300  animate-pulse ">Life  </span>is  Short
        </h1>
      </div>
</section>

{/* page 3 */}

      <section className="h-screen  bg-black">

        <div className="sticky flex justify-center items-center h-3/4 w-7/10  bg-black/90  ml-[31vh] px-20 shadow-2xl gap-10">

<div className="w-3/4 bg-black/90">
 <h1 className=" text-[1.5vw]  text-white/80 font-mono  leading-8  h-3/4">
        <span className="text-white">The definition of life</span>  has long been a challenge for scientists and philosophers. This is partially because life is a process, not a substance. This is complicated by a lack of knowledge of the characteristics of living entities, if any, that may have developed outside Earth.Philosophical definitions of life have also been put forward, with similar difficulties on how to distinguish living things from the non-living.Legal definitions of life have been debated, though these generally focus on the decision to declare a human dead, and the legal ramifications of this decision.At least 123 definitions of life have been compiled.
          </h1>
</div>
          <div className=" flex justify-center items-center flex-wrap w-1/4 border-2 hover:transition-all hover:scale-105 duration-300  shadow-2xl bg-black">
          <img src={Downld} className=" p-1 " alt="SOul" />
          <h3 className=" p-1 text-[1vw] font-extrabold text-black hover:text-black/90 underline">Life has never been good to good</h3>
          </div>
        </div>
      </section>
      <section className="h-screen relative flex justify-center bg-black items-center">
        <div className="relative h-screen   w-full   bg-black   p-12 ">
          <h3 className=" text-[1.5vw] text-white/90 font-serif leading-20 font-extrabold transition-transform hover:text-purple-300 ">
          Time is quietly slipping through our hands every single day,
never stopping, never warning us that we’re growing older.
We get so lost in routines, deadlines, and responsibilities that
we forget there’s a world outside of this endless cycle of work.
Life is far bigger, deeper, and more beautiful than we often allow ourselves to see.

There are sunsets we haven’t watched,
stories we haven’t lived,
and people we haven’t truly known.

Sometimes we need to pause, breathe, and remind ourselves that
life is not just about surviving —
it’s about experiencing, discovering, and becoming.
{/* <Card /> */}
          
          </h3>
        </div>
      </section>
    </div>
  )
};

export default Page;