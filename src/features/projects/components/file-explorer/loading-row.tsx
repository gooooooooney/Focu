import { cn } from "@/lib/utils"
import { getItemPadding } from "./constants"
import { Spinner } from "@/components/ui/spinner"

export const LoadingRow = ({ level, className }: { level: number, className?: string }) => {
    return (
        <div className={
            cn("flex items-center h-5.5 ", className)
        }
        style={{
            paddingLeft: getItemPadding(level, true),
        }}
        >
           <Spinner className="size-4 text-ring ml-0.5" />
        </div>
    )
}
