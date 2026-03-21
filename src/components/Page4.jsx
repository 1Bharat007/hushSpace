import React from 'react';
import Ending from './Ending.webp'; 
import Card from './card';
import StreetSnow from './IMG-20250227-WA0165.jpg' 
import MEsing from './IMG_20250715_155029_158.webp'
import Meback from './IMG_20250404_005510_452.webp'
import Mehair from './IMG_20230210_002924.jpg'
import MeoldFriends from './IMG-20241021-WA0215.jpg'
import OnlyMe from './IMG-20241021-WA0014.jpg'
import OnlyMe1 from './IMG-20241019-WA0060.jpg'


const Page4 = () => {
  return (
    <div className="relative h-[80vh] bg-black  flex flex-wrap justify-center items-center   ">
   {/* <img src={Ending} className='z-20'  alt="Ending" /> */}
   <div className='overflow-x-scroll scrollbar-hide relative'>
   <div className='flex  gap-x-24  animate-loop relative'
   >
              <Card userImage={Meback} user="No   hello     Name " enroll=""></Card>
               <Card userImage={StreetSnow} user="MI Amor"></Card>
              {/* <Card userImage={Ending} user="Me" enroll=""></Card> */}
               <Card userImage={MEsing} user="Alone" enroll=""></Card>
              <Card userImage={Meback} user="Used to be  " enroll=""></Card>
              <Card userImage={Mehair} user="MI amor" enroll=""></Card>
              {/* <Card userImage={Ending} user="Me" enroll=""></Card> */}
              <Card userImage={OnlyMe} user="..." enroll=""></Card>
              <Card userImage={OnlyMe1} user="... " enroll=""></Card>
              <Card userImage={MeoldFriends} user="... " enroll=""></Card>
              <Card userImage={Meback} user="..." enroll=""></Card> 
              <Card userImage={MEsing} user="..." enroll=""></Card>
              <Card userImage={Meback} user="..." enroll=""></Card>
            
              <Card userImage={OnlyMe1} user="..." enroll=""></Card>
   </div>
   </div>
    </div>
  );
};

export default Page4;
