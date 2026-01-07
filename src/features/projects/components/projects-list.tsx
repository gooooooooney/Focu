import { Spinner } from "@/components/ui/spinner";
import { useProjectsPartial } from "../hooks/use-projects";
import { Kbd } from "@/components/ui/kbd";
import { Doc } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { IconAlertCircle, IconArrowNarrowRight, IconLoader2, IconNetwork, IconWorld } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { FaGithub } from "react-icons/fa"
import { Button } from "@/components/ui/button";

interface ProjectsListProps {
    onViewAll: () => void;
}

const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
};

const getProjectIcon = (data: Doc<"projects">) => {
    if (data.importStatus === "completed") {
        return <FaGithub className="size-3.5 text-muted-foreground" />;
    }
    if (data.importStatus === "failed") {
        return <IconAlertCircle className="size-3.5 text-muted-foreground" />;
    }
    if (data.importStatus === "importing") {
        return <IconLoader2 className="size-3.5 text-muted-foreground animate-spin" />;
    }
    return <IconWorld className="size-3.5 text-muted-foreground" />;
};


const ContinueCard = ({ data }: { data: Doc<"projects"> }) => {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
                Last updated
            </span>

            <Button
                variant="outline"
                nativeButton={false}
                className="h-auto items-start justify-start p-4 bg-background!  hover:bg-foreground/20! border rounded-none flex flex-col gpa-2"
                render={<Link className="group" href={`/projects/${data._id}`}>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            {getProjectIcon(data)}
                            <span className="truncate font-medium">
                                {data.name}
                            </span>
                        </div>
                        <IconArrowNarrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatTimestamp(data.updatedAt)}
                    </span>
                </Link>}
            />

        </div>
    )
};



const ProjectItem = ({ data }: { data: Doc<"projects"> }) => {
    return (
        <Link
            className="text-sm text-foreground/60 font-medium hover:text-foreground py-1 flex items-center justify-between w-full group"
            href={`/projects/${data._id}`}>
            <div className="flex items-center gap-2">
                {getProjectIcon(data)}
                <span className="truncate">{data.name}</span>
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
                {
                    formatTimestamp(data.updatedAt)
                }
            </span>
        </Link>
    )
};


export const ProjectsList = ({ onViewAll }: ProjectsListProps) => {
    const projects = useProjectsPartial(6)

    if (projects === undefined) {
        return <Spinner className="size-4 text-ring" />
    }

    const [mostRecent, ...rest] = projects;

    return (
        <div className="flex flex-col gap-4 w-full">
            {mostRecent && <ContinueCard data={mostRecent} />}
            {
                rest.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                                Recent projects
                            </span>
                            <button
                                onClick={onViewAll}
                                className="flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
                            >
                                <span>View all</span>
                                <Kbd className="bg-accent border">
                                    ⌘K
                                </Kbd>
                            </button>
                        </div>
                        <ul className="flex flex-col">
                            {rest.map((project) => (
                                <ProjectItem key={project._id} data={project} />
                            ))}
                        </ul>
                    </div>
                )
            }
        </div>
    );
};
