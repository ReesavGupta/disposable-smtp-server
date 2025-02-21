import { mailType } from '@/types'
import { useRouter } from 'next/navigation'
export const Card = ({ mail }: { mail: mailType }) => {
    const router = useRouter()
    const onClickHandler = () => {}
    return (
        <div className="flex">
            <div
                onClick={onClickHandler}
                className=" neutro-box flex flex-col gap-3 justify-center items-start border"
            >
                <div>from : {mail.From}</div>
                <div>subject : {mail.Subject}</div>
            </div>
        </div>
    )
}
