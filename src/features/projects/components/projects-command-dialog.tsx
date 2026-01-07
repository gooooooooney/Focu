import { IconAlertCircle, IconLoader2, IconWorld } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import { useProjects } from "../hooks/use-projects";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface ProjectsCommandDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}


const getProjectIcon = (data: Doc<"projects">) => {
    if (data.importStatus === "completed") {
        return <FaGithub className="size-4 text-muted-foreground" />;
    }
    if (data.importStatus === "failed") {
        return <IconAlertCircle className="size-4 text-muted-foreground" />;
    }
    if (data.importStatus === "importing") {
        return <IconLoader2 className="size-4 text-muted-foreground animate-spin" />;
    }
    return <IconWorld className="size-4 text-muted-foreground" />;
};

export const ProjectsCommandDialog = ({
    open,
    onOpenChange
}: ProjectsCommandDialogProps) => {
    const router = useRouter();
    const projects = useProjects();

    const handleSelectProject = (projectId: string) => {
        router.push(`/projects/${projectId}`);
        onOpenChange(false);
    };

    return (
        <CommandDialog
            open={open}
            
            onOpenChange={onOpenChange}
            title="Search Projects"
            className="max-w-md!"
            description="Search and navigate to your projects"
        >
            <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandList>
                    <CommandEmpty>No projects found</CommandEmpty>
                    <CommandGroup heading="Projects">
                        {
                            projects?.map(project => (
                                <CommandItem
                                    value={`${project._id}-${project.name}`}
                                    key={project._id}
                                    onSelect={() => handleSelectProject(project._id)}
                                >
                                    {getProjectIcon(project)}
                                    <p className="text-sm truncate">{project.name}</p>
                                </CommandItem>
                            ))
                        }
                    </CommandGroup>
                </CommandList>
            </Command>
        </CommandDialog>
    )
};
