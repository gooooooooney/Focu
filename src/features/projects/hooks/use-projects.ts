import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export const useProjects = () => {
    return useQuery(api.projects.get)
}

export const useProjectsPartial = (limit: number) => {
    return useQuery(api.projects.getPartial, { limit })
}

export const useCreateProject = () => {
    return useMutation(api.projects.create).withOptimisticUpdate(
        (localStore, args) => {
            const existingProjects = localStore.getQuery(api.projects.get)

            if (existingProjects !== undefined) {
                const now = Date.now()
                const newProject: typeof existingProjects[0] = {
                    _id: crypto.randomUUID() as Id<"projects">,
                    _creationTime: now,
                    name: args.name,
                    updatedAt: now,
                    ownerId: "anonymous"
                }

                localStore.setQuery(api.projects.get, {}, [
                    newProject,
                    ...existingProjects,
                ])
            }
        }
    )
}


export const useProject = (projectId: Id<"projects">) => {
    return useQuery(api.projects.getById, { id: projectId })
}


export const useRenameProject = () => {
    return useMutation(api.projects.rename)
        .withOptimisticUpdate(
            (localStore, args) => {
                const project = localStore.getQuery(api.projects.getById, {
                    id: args.id,
                })
                if (project) {
                    localStore.setQuery(
                        api.projects.getById,
                        { id: args.id },
                        {
                            ...project,
                            name: args.name,
                            updatedAt: Date.now(),
                        })
                }

                const projects = localStore.getQuery(api.projects.get)

                if (projects !== undefined) {
                    localStore.setQuery(
                        api.projects.get,
                        {},
                        projects.map((p) => {
                            if (p._id === args.id) {
                                return {
                                    ...p,
                                    name: args.name,
                                    updatedAt: Date.now(),
                                }
                            }
                            return p
                        })
                    )
                }
            }
        )
}
