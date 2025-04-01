import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Page = () => {
  return (
     <>
       <section className="card-cta">
         <div className="flex flex-col gap-6 max-w-lg">
           <h2>Want to upgrade your skill with our courses and interviews?</h2>
           <p>Enroll in courses you like and take demo interviews and get instant feedbacks!</p>
            <Button asChild className="btn btn-primary max-sm:w-full">
              <Link href="/interview"> Start an Interview </Link>
            </Button>
         </div>

         <Image src="/robot.png" alt="robot" width={400} height={400} className="max-sm:hidden"/>
       </section>

     </>

  )
}
export default Page