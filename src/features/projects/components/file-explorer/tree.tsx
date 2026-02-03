import { IconChevronRight, IconFileFunction } from "@tabler/icons-react"
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import {
    useCreateFile,
    useCreateFolder,
    useFolderContents,
    useRenameFile,
    useDeleteFile,
} from "@/features/projects/hooks/use-files";
import { Doc, Id } from "../../../../../convex/_generated/dataModel"
import { getItemPadding } from "./constants"
import { CreateInput } from "./create-input"
import { useState } from "react"
import { TreeItemWrapper } from "./tree-item-wrapper"
import { cn } from "@/lib/utils"
import { LoadingRow } from "./loading-row"
import { RenameInput } from "./rename-input"
import { useEditor } from "@/features/editor/hooks/use-editor"

interface TreeProps {
    item: Doc<"files">
    level: number
    projectId: Id<"projects">
}

export const Tree = ({ item, level, projectId }: TreeProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const [isRenaming, setIsRenaming] = useState(false)


    const [creating, setCreating] = useState<"file" | "folder" | null>(null)

    const startCreateFile = (type: "file" | "folder") => {
        setIsOpen(true)
        setCreating(type)
    }

    // Mutations
    const createFile = useCreateFile()

    const createFolder = useCreateFolder()

    const renameFile = useRenameFile({
        projectId,
        parentId: item.parentId,
    });
    const deleteFile = useDeleteFile({
        projectId,
        parentId: item.parentId,
    });

    const folderContents = useFolderContents({
        projectId: projectId,
        parentId: item._id,
        enabled: item.type === "folder",
    })

    const { openFile, closeTab, activeTabId } = useEditor(projectId)

    const handleRename = (name: string) => {
        setIsRenaming(false)

        if (name === item.name) return
        renameFile({
            id: item._id,
            newName: name,
        })
    }

    const handleCreate = (name: string) => {
        if (creating === "file") {
            createFile({
                projectId,
                content: "",
                parentId: item._id,
                name,
            })
        } else if (creating === "folder") {
            createFolder({
                projectId,
                parentId: item._id,
                name: name,
            })
        }
        setCreating(null)
    }

    if (item.type === "file") {
        const fileName = item.name

        const isActive = activeTabId === item._id

        if (isRenaming) {
            return (
                <RenameInput
                    type="file"
                    level={level}
                    defaultValue={fileName}
                    isOpen={isOpen}
                    onSubmit={handleRename}
                    onCancel={() => {
                        setIsRenaming(false)
                    }}
                />
            )
        }
        return (
            <TreeItemWrapper
                item={item}
                level={level}
                isActive={isActive}
                onClick={() => {
                    openFile(item._id, { pinned: false })
                }}
                onDoubleClick={() => {
                    openFile(item._id, { pinned: true })
                }}
                onRename={() => {
                    setIsRenaming(true)
                }}
                onDelete={() => {
                    closeTab(item._id)
                    deleteFile({
                        id: item._id,
                    })
                }}
            >
                <FileIcon fileName={fileName} autoAssign className="size-4" />
                <span className="truncate text-sm">
                    {fileName}
                </span>
            </TreeItemWrapper>
        )
    }

    const folderName = item.name

    const folderContentRender = (
        <>
            <div className="flex items-center gap-0.5">
                <IconChevronRight
                    className={cn(
                        "size-4 shrink-0 text-muted-foreground",
                        isOpen && "rotate-90"
                    )}
                />
                <FolderIcon folderName={folderName} className="size-4" />
                <span className="truncate text-sm">
                    {folderName}
                </span>
            </div>
        </>
    )

    if (creating) {
        return (
            <>
                <button
                    onClick={() => {
                        setIsOpen((prev) => !prev)
                    }}
                    className="group flex  items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
                    style={{ paddingLeft: getItemPadding(level, false) }}
                >
                    {folderContentRender}
                </button>
                {
                    isOpen && (
                        <>
                            {
                                folderContents === undefined && <LoadingRow level={level + 1} />
                            }
                            <CreateInput
                                type={creating}
                                level={level + 1}
                                onSubmit={handleCreate}
                                onCancel={() => {
                                    setCreating(null)
                                }}
                            />
                            {
                                folderContents?.map((subItem) => (
                                    <Tree key={subItem._id} item={subItem} level={level + 1} projectId={projectId} />
                                ))
                            }
                        </>
                    )
                }
            </>
        )
    }


    if (isRenaming) {
        return (
            <>
                <RenameInput
                    type="folder"
                    level={level}
                    defaultValue={folderName}
                    isOpen={isOpen}
                    onSubmit={handleRename}
                    onCancel={() => {
                        setIsRenaming(false)
                    }}
                />
                {
                    isOpen && (
                        <>
                            {
                                folderContents === undefined && <LoadingRow level={level + 1} />
                            }
                            {
                                folderContents?.map((subItem) => (
                                    <Tree key={subItem._id} item={subItem} level={level + 1} projectId={projectId} />
                                ))
                            }
                        </>
                    )
                }
            </>
        )
    }

    return (
        <>
            <TreeItemWrapper
                item={item}
                level={level}
                isActive={false}
                onClick={() => {
                    setIsOpen((prev) => !prev)
                }}
                onRename={() => {
                    setIsRenaming(true)
                }}
                onDelete={() => {
                    deleteFile({
                        id: item._id,
                    })
                }}
                onCreateFile={() => {
                    startCreateFile("file")
                }}
                onCreateFolder={() => {
                    startCreateFile("folder")
                }}
            >
                {folderContentRender}

            </TreeItemWrapper>
            {
                isOpen && (
                    <>
                        {
                            folderContents === undefined && <LoadingRow level={level + 1} />
                        }
                        {
                            folderContents?.map((subItem) => (
                                <Tree key={subItem._id} item={subItem} level={level + 1} projectId={projectId} />
                            ))
                        }
                    </>
                )
            }
        </>
    )
}
