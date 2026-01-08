import { ProjectIdView } from "@/features/projects/components/project-id-view"
import { Id } from "../../../../convex/_generated/dataModel"


const Project = async (params: PageProps<'/projects/[projectId]'>) => {
    const { projectId } = await params.params
    return (
        <ProjectIdView projectId={projectId as Id<"projects">}>

        </ProjectIdView>
    )
}

export default Project
