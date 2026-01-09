import { IconChevronRight, IconFile } from "@tabler/icons-react"
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { useCreateFile, useCreateFolder, useDeleteFile, useFolderContents, useRenamingFile } from "../../hooks/use-files"
import { Doc, Id } from "../../../../../convex/_generated/dataModel"
import { getItemPadding } from "./constants"
import { CreateInput } from "./create-input"
import { useState } from "react"

interface TreeProps {
    item: Doc<"files">
    level: number
    projectId: Id<"projects">
}

export const Tree = ({ item, level, projectId }: TreeProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const [isRenaming, setIsRenaming] = useState(false)

    const [creating, setCreating] = useState<"file" | "folder" | null>(null)

    // Mutations
    const createFile = useCreateFile()

    const createFolder = useCreateFolder()

    const renameFile = useRenamingFile()

    const deleteFile = useDeleteFile()

    const folderContents = useFolderContents({
        projectId: projectId,
        parentId: item._id,
        enabled: item.type === "folder",
    })

    return null
}
