import { IconChevronRight, IconFile } from "@tabler/icons-react"
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"
import { useState } from "react"
import { getItemPadding } from "./constants"


interface CreateInputProps {
    type: "file" | "folder"
    level: number
    onSubmit: (name: string) => void
    onCancel: () => void
}

export const CreateInput: React.FC<CreateInputProps> = ({ type, level, onSubmit, onCancel }) => {
    const [value, setValue] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        const trimmedValue = value.trim()
        if (trimmedValue) {
            onSubmit(trimmedValue)
        } else {
            onCancel()
        }
    }
    return (
        <div
            style={{
                paddingLeft: getItemPadding(level, type === "file"),
            }}
            className="w-full flex items-center gap-1 h-5.5 bg-accent/30"
        >
            <div className="flex items-center gap-0.5">
                {
                    type === "folder" ? (
                        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                        <FileIcon
                            autoAssign
                            className="size-4"
                            fileName={value}
                        />
                    )
                }

                {
                    type === "folder" && (
                        <FolderIcon
                            className="size-4"
                            folderName={value}
                        />
                    )
                }
            </div>
            <input
                type="text"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
                onBlur={handleSubmit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSubmit(e)
                    }
                    if (e.key === "Escape") {
                        onCancel()
                    }
                }}
            />
        </div>
    )
}