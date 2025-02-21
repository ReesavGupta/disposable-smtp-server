'use client'
import { Card } from '@/components/Card'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState<string>('')
    const emailParam = searchParams.get('email')
    useEffect(() => {
        setEmail(emailParam!)
    }, [email])
    return (
        <div>
            <div>Mails for {email} </div>

            <div>
                <Card />
            </div>
        </div>
    )
}
