"use client"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"
import { IconBrandGithub, IconBrandGithubFilled, IconSparkles } from "@tabler/icons-react"
import { Poppins } from "next/font/google"
import { ProjectsList } from "./projects-list"
import { useCreateProject } from "../hooks/use-projects"
import {
    adjectives,
    animals,
    colors,
    uniqueNamesGenerator
} from "unique-names-generator"
import { FaGithub } from "react-icons/fa"
import { useEffect, useState } from "react"
import { ProjectsCommandDialog } from "./projects-command-dialog"


const font = Poppins({
    subsets: ['latin'],
    weight: ['400', "500", "600", '700']
})

export const ProjectsView = () => {

    const createProject = useCreateProject()

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey) {
                if (event.key === "k") {
                    event.preventDefault()
                    setCommandDialogOpen(true)
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    const [commandDialogOpen, setCommandDialogOpen] = useState(false)

    return (
        <>
            <ProjectsCommandDialog open={commandDialogOpen} onOpenChange={setCommandDialogOpen} />
            <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
                <div className="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">
                    <div className="flex justify-between w-full gap-4 items-center">
                        <div className="flex gap-2 w-full items-center group/logo">
                            <img src="/logo.svg" alt="Focu" className="size-8 md:size-10" />
                            <h1 className={cn(
                                "text-4xl md:text-5xl font-semibold",
                                font.className
                            )}>
                                Focu
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const name = uniqueNamesGenerator({
                                        dictionaries: [
                                            adjectives,
                                            colors,
                                            animals
                                        ],
                                        separator: "-",
                                        length: 3
                                    })
                                    createProject({
                                        name,
                                    })
                                }}
                                className="h-full items-start justify-start p-4 bg-background!  hover:bg-foreground/20! border flex flex-col gap-6 rounded-none"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <IconSparkles className="size-4" />
                                    <Kbd
                                        className="bg-accent border"
                                    >
                                        ⌘J
                                    </Kbd>
                                </div>
                                <div>
                                    <span className="text-sm">
                                        New
                                    </span>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => { }}
                                className="h-full items-start justify-start p-4 bg-background!  hover:bg-foreground/20! border flex flex-col gap-6 rounded-none"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <FaGithub className="size-4" />
                                    <Kbd
                                        className="bg-accent border"
                                    >
                                        ⌘I
                                    </Kbd>
                                </div>
                                <div>
                                    <span className="text-sm">
                                        Import
                                    </span>
                                </div>
                            </Button>
                        </div>

                        <ProjectsList onViewAll={() => {
                            setCommandDialogOpen(true)
                        }} />
                    </div>
                </div>
            </div>
        </>
    )
}
