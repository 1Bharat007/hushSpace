import React from 'react'

const Card = (Props) => {

  const { userImage, user, enroll } = Props;  

  return (
    <div className="flex p-6 bg-black">
      <div className="h-[40vh] w-60 bg-black border-2 border-white rounded-2xl p-6 flex flex-col items-center justify-start gap-4 
                      hover:scale-105 transition duration-300 shadow-md">

       
        {userImage && (
          <img  
            src={userImage}
            alt={user}
            className="w-full h- object-cover rounded-lg shadow"
          />
        )}    

        <h1 className="text-white text-2xl font-bold">{user}</h1>
        {enroll && (
          <h3 className="text-white text-lg font-extrabold">{enroll}</h3>
        )}
      </div>
    </div>
  )
}

export default Card
