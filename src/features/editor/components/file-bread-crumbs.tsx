import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Id } from "../../../../convex/_generated/dataModel"
import { useFilePath } from "@/features/projects/hooks/use-files"
import { useEditor } from "../hooks/use-editor"
import React from "react"
import { FileIcon } from "@react-symbols/icons/utils"


export const FileBreadCrumbs = (
    { projectId }: { projectId: Id<"projects"> }
) => {
    const { activeTabId } = useEditor(projectId)
    const filePath = useFilePath(activeTabId)

    if (filePath === undefined || !activeTabId) {
        return (
            <div className="p-2 bg-background pl-4 border-b">
                <Breadcrumb>
                    <BreadcrumbList className="gap-0.5">
                        <BreadcrumbItem className="text-sm">
                            <BreadcrumbPage>
                                &nbsp;
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        )
    }

    return (
        <div className="p-2 bg-background pl-4 border-b">
            <Breadcrumb>
                <BreadcrumbList className="gap-0.5">
                    {
                        filePath.map((path, index) => {
                            const isLast = index === filePath.length - 1;
                            return (
                                <React.Fragment key={path._id}>
                                    <BreadcrumbItem key={index} className="text-sm">
                                        {
                                            isLast ? (
                                                <BreadcrumbPage className="flex items-center gap-1">
                                                    <FileIcon fileName={path.name} autoAssign className="size-4" />
                                                    {path.name}
                                                </BreadcrumbPage>
                                            )
                                                :
                                                (
                                                    <BreadcrumbLink href="#">
                                                        {path.name}
                                                    </BreadcrumbLink>
                                                )
                                        }
                                    </BreadcrumbItem>
                                    {
                                        !isLast && (
                                            <BreadcrumbSeparator />
                                        )
                                    }
                                </React.Fragment>
                            )
                        }
                        )
                    }
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}