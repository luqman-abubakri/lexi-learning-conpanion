import Link from "next/link"; 
import { BookMarkedIcon, Clock } from "lucide-react"; 

interface CompanionCardProps { 
  id: string; 
  name: string; 
  topic: string; 
  subject: string; 
  duration: number; 
  color: string; 
} 

const CompanionCard = ({
  id, 
  name, 
  topic, 
  subject, 
  duration, 
  color
}: CompanionCardProps) => { 
  return ( 
    <div className="w-full h-full max-w-md mx-auto sm:max-w-full"> 
      <article 
        className="rounded-xl p-5 md:p-6 h-full flex flex-col justify-between transition-shadow hover:shadow-md" 
        style={{ backgroundColor: color }}
      > 
        {/* Top Header Row */}
        <div className="flex justify-between items-center gap-4 mb-5"> 
          <div className="bg-black px-3 py-1 rounded-full text-xs md:text-sm font-medium text-white tracking-wide whitespace-nowrap">
            {subject}
          </div> 
          <button 
            className="bg-black text-white p-2.5 rounded-full hover:bg-neutral-800 transition-colors shrink-0"
            aria-label="Bookmark lesson"
          > 
            <BookMarkedIcon className="w-4 h-4 md:w-5 md:h-5"/> 
          </button> 
        </div> 

        {/* Text Content Area */}
        <div className="space-y-1.5 mb-4 flex-grow">
          <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-neutral-900 break-words">
            {name}
          </h2> 
          <p className="text-sm md:text-base text-neutral-800 font-medium opacity-90 break-words">
            {topic}
          </p> 
        </div>

        {/* Info & Action Footer Area */}
        <div className="mt-auto space-y-4">
          {/* Duration Badge */}
          <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-neutral-900"> 
            <Clock className="w-4 h-4 shrink-0"/> 
            <span>{duration} mins</span>
          </div> 

          {/* Action Button */}
          <Link href={`/companions/${id}`} className="block w-full"> 
            <button className="bg-black w-full text-center py-3 px-4 rounded-xl text-white font-semibold text-sm md:text-base hover:bg-neutral-800 active:scale-[0.99] transition-all"> 
              Launch Lessons 
            </button> 
          </Link> 
        </div>

      </article> 
    </div> 
  ) 
} 

export default CompanionCard;
