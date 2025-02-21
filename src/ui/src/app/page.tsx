'use client'
import AnimatedBackground from '@/components/AnimatedBackground'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
    const [email, setEmail] = useState<string>('')
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
    const router = useRouter()
    const handleOnClick = async (): Promise<void> => {
        setIsSubmitted((prev) => !prev)
        router.push(`/dashboard?email=${email}`)
    }
    useEffect(() => {
        console.log(isSubmitted)
    }, [isSubmitted])
    return (
        <div className="border w-full flex justify-center items-center flex-col ">
            <AnimatedBackground />
            <div className="w-[100%] border border-red-400 text-center">
                <h1>This is Turbo Mail or some jazz lol</h1>
            </div>
            <div className="flex flex-col justify-center items-center gap-3">
                <div className="w-[100%] border border-green-400">
                    <input
                        type="text"
                        placeholder="Email I.D."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="w-full">
                    <button
                        onClick={handleOnClick}
                        className="w-full text-white bg-orange-500"
                    >
                        GO!
                    </button>
                </div>
            </div>
        </div>
    )
}
