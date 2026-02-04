import { useFile, useUpdateFile } from "@/features/projects/hooks/use-files";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEditor } from "../hooks/use-editor";
import { FileBreadCrumbs } from "./file-bread-crumbs";
import { TopNavigation } from "./top-navigation";
import Image from "next/image";
import { CodeEditor } from "./code-editor";
import { useEffect, useRef } from "react";
import { useDebouncedCallback } from "@tanstack/react-pacer"
import { AlertTriangleIcon } from "lucide-react";

const DEBOUNCE_MS = 1500;

export default function EditorView({ projectId }: { projectId: Id<"projects"> }) {

  const { activeTabId } = useEditor(projectId)

  const activeFile = useFile(activeTabId)

  const updateFile = useUpdateFile()

  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  const isActiveFileBinary = activeFile && activeFile.storageId
  const isActiveFileText = activeFile && !activeFile.storageId

  const handleUpdate = useDebouncedCallback((value: string) => {
    if (!activeFile) return
    updateFile({
      id: activeFile._id,
      content: value,
    })
  }, {
    wait: DEBOUNCE_MS,
  })

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>
      {
        activeTabId && <FileBreadCrumbs projectId={projectId} />
      }
      <div className="flex-1 min-h-0 bg-background">
        {
          !activeFile && (
            <div className="size-full flex items-center justify-center">
              <Image
                src="/logo-alt.svg"
                alt="Focu"
                width={50}
                height={50}
                className="opacity-50"
              />
            </div>
          )
        }
        {
          isActiveFileText && (
            <CodeEditor
              key={activeFile._id}
              fileName={activeFile.name}
              initialValue={activeFile.content}
              onChange={handleUpdate}
            />
          )
        }
        {isActiveFileBinary && (
          <div className="size-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2.5 max-w-md text-center">
              <AlertTriangleIcon className="size-10 text-yellow-500" />
              <p className="text-sm">
                The file is not displayed in the text editor because it is either binary or uses an unsupported text encoding.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
