import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Id } from "../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import { UserButton } from "@clerk/nextjs"
import { useProject, useRenameProject } from "../hooks/use-projects"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IconCloudCheck, IconLoader2 } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"


const font = Poppins({
    subsets: ['latin'],
    weight: ['400', "500", "600", '700']
})

export const Navbar = ({ projectId }: { projectId: Id<"projects"> }) => {

    const project = useProject(projectId)

    const renameProject = useRenameProject()

    const [renameProjectName, setRenameProjectName] = useState("")

    const [isRenameing, setIsRenameing] = useState(false)

    const handleStartRename = () => {
        if (!project) return
        setIsRenameing(true)
        setRenameProjectName(project?.name || "")
    }

    const handleSubmit = () => {

        setIsRenameing(false)

        const trimmedName = renameProjectName.trim()

        // If the name is empty or the same as before, do nothing
        if (trimmedName === "" || trimmedName === project?.name) {
            return
        }

        renameProject({
            id: projectId,
            name: renameProjectName
        })
    }

    const handleOnKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit()
        } else if (e.key === "Escape") {
            setIsRenameing(false)
        }
    }

    return (
        <nav className="flex justify-between items-center gap-x-2 p-2 bg-sidebar border-b">
            <div className="flex items-center gap-x-2 ">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink className="flex items-center gap-1.5 "
                                render={
                                    <Button
                                        className="w-fit! p-1.5! h-7!"
                                        render={
                                            <Link href={`/`}>
                                                <Image src="/logo.svg" alt="Logo" width={20} height={20} />
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    font.className
                                                )}>
                                                    Fouc
                                                </span>
                                            </Link>
                                        }
                                        variant="ghost" />
                                }
                            />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="ml-0! mr-1" />
                        <BreadcrumbItem>

                            {
                                isRenameing ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={renameProjectName}
                                        onChange={(e) => setRenameProjectName(e.target.value)}
                                        onFocus={(e) => e.currentTarget.select()}
                                        onBlur={handleSubmit}
                                        onKeyDown={handleOnKeyDown}
                                        className="text-sm bg-transparent text-foreground outline-none focus:ring-ring font-medium max-w-40 truncate"
                                    />
                                ) :
                                    (
                                        <BreadcrumbPage
                                            onClick={handleStartRename}
                                            className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
                                        >
                                            {project?.name || "Loading..."}
                                        </BreadcrumbPage>
                                    )
                            }

                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {
                    project?.importStatus === "importing" ? (
                        <Tooltip>
                            <TooltipTrigger
                                render={<IconLoader2 className="size-4 text-muted-foreground animate-spin" />}
                            />
                            <TooltipContent>
                                Importing project...
                            </TooltipContent>
                        </Tooltip>
                    ) : (

                        <Tooltip>
                            <TooltipTrigger
                                render={<IconCloudCheck className="size-4 text-muted-foreground" />}
                            />
                            <TooltipContent>
                                Saved {" "}
                                {
                                    project?.updatedAt ? formatDistanceToNow(
                                        new Date(project.updatedAt),
                                        {
                                            addSuffix: true
                                        }
                                    )
                                    : "Unknown"
                                }
                            </TooltipContent>
                        </Tooltip>

                    )
                }
            </div>
            <div className="flex items-center gap-2">
                <UserButton />
            </div>
        </nav>
    )
}
