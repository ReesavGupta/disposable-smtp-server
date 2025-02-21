'use client'
import { Card } from '@/components/Card'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { mails } from '../constants'

export default function Page() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState<string>('')
    const emailParam = searchParams.get('email')

    useEffect(() => {
        setEmail(emailParam!)
    }, [email])

    return (
        <div>
            <div className="font-bold ">Mails for "{email}" </div>

            <div className="neutro-box border border-red-500 w-[60%] m-auto flex gap-10 flex-wrap justify-center">
                {mails.map((elem, index) => (
                    <Card mail={elem} key={index} />
                ))}
            </div>
        </div>
    )
}
