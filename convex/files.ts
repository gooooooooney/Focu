import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { verifyAuth } from "./auth"
import { Id } from "./_generated/dataModel"

export const getFiles = query({
    args: {
        projectId: v.id("projects"),
    },
    async handler(ctx, args) {
        const identity = await verifyAuth(ctx)

        const project = await ctx.db.get("projects", args.projectId)

        if (!project) {
            throw new Error("Project not found")
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized access to this project")
        }

        return await ctx.db
            .query("files")
            .withIndex("by_project", q => q.eq("projectId", project._id))
            // .order("desc")
            .collect()
    },
})

export const getFile = query({
    args: {
        id: v.id("files"),
    },
    async handler(ctx, args) {
        const identity = await verifyAuth(ctx)

        const file = await ctx.db.get("files", args.id)

        if (!file) {
            throw new Error("File not found")
        }


        const project = await ctx.db.get("projects", file.projectId)

        if (!project) {
            throw new Error("Project not found")
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized access to this project")
        }

        return await ctx.db
            .query("files")
            .withIndex("by_project", q => q.eq("projectId", project._id))
            // .order("desc")
            .collect()
    },
})


export const getFolderContents = query({
    args: {
        parentId: v.optional(v.id("files")),
        projectId: v.id("projects"),
    },
    async handler(ctx, args) {
        const identity = await verifyAuth(ctx)



        const project = await ctx.db.get("projects", args.projectId)

        if (!project) {
            throw new Error("Project not found")
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized access to this project")
        }

        const files = await ctx.db.query("files")
            .withIndex("by_project_parent",
                q =>
                    q.eq("projectId", args.projectId)
                        .eq("parentId", args.parentId)
            )
            .collect()


        return files.sort((a, b) => {
            if (a.type === "folder" && b.type === "file") return -1;
            if (a.type === "file" && b.type === "folder") return 1;

            return a.name.localeCompare(b.name);
        })
    },
})



export const createFile = mutation({
    args: {
        parentId: v.optional(v.id("files")),
        projectId: v.id("projects"),
        name: v.string(),
        content: v.string(),
    },
    async handler(ctx, args) {
        const identity = await verifyAuth(ctx)



        const project = await ctx.db.get("projects", args.projectId)

        if (!project) {
            throw new Error("Project not found")
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized access to this project")
        }

        //  check for duplicate file name
        const files = await ctx.db.query("files")
            .withIndex("by_project_parent",
                q =>
                    q.eq("projectId", args.projectId)
                        .eq("parentId", args.parentId)
            )
            .collect()


        const existing = files.find(file => file.name === args.name && file.type === "file")


        if (existing) {
            throw new Error("File with this name already exists")
        }
        const now = Date.now()

        await ctx.db.insert("files", {
            name: args.name,
            content: args.content,
            projectId: args.projectId,
            parentId: args.parentId,
            type: "file",
            updatedAt: now,
        })

        await ctx.db.patch("projects", args.projectId, {
            updatedAt: now,
        })

    },
})

export const createFolder = mutation({
    args: {
        parentId: v.optional(v.id("files")),
        projectId: v.id("projects"),
        name: v.string(),
    },
    async handler(ctx, args) {
        const identity = await verifyAuth(ctx)



        const project = await ctx.db.get("projects", args.projectId)

        if (!project) {
            throw new Error("Project not found")
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized access to this project")
        }

        //  check for duplicate folder name
        const files = await ctx.db.query("files")
            .withIndex("by_project_parent",
                q =>
                    q.eq("projectId", args.projectId)
                        .eq("parentId", args.parentId)
            )
            .collect()


        const existing = files.find(file => file.name === args.name && file.type === "folder")


        if (existing) {
            throw new Error("Folder with this name already exists")
        }

        const now = Date.now()

        await ctx.db.insert("files", {
            name: args.name,
            projectId: args.projectId,
            parentId: args.parentId,
            type: "folder",
            updatedAt: now,
        })

        await ctx.db.patch("projects", args.projectId, {
            updatedAt: now,
        })

    },
})

export const renameFile = mutation({
    args: {
        id: v.id("files"),
        newName: v.string(),
    },
    async handler(ctx, args) {
        const identity = await verifyAuth(ctx)

        const file = await ctx.db.get("files", args.id)

        if (!file) {
            throw new Error("File not found")
        }

        const project = await ctx.db.get("projects", file.projectId)

        if (!project) {
            throw new Error("Project not found")
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized access to this project")
        }

        //  Check if a file with the same name already exists

        const siblings = await ctx.db.query("files")
            .withIndex("by_project_parent",
                q =>
                    q.eq("projectId", file.projectId)
                        .eq("parentId", file.parentId)
            )
            .collect()

        // Check siblings for duplicate name
        const existing = siblings.find(sibling => sibling.name === args.newName && sibling.type === file.type && sibling._id !== args.id)

        if (existing) {
            throw new Error(`A ${file.type} with this name already exists`)
        }
        const now = Date.now()

        await ctx.db.patch("files", args.id, {
            name: args.newName,
            updatedAt: now,
        })

        await ctx.db.patch("projects", file.projectId, {
            updatedAt: now,
        })
    },
})

export const deleteFile = mutation({
    args: {
        id: v.id("files"),
    },
    async handler(ctx, args) {
        const identity = await verifyAuth(ctx)

        const file = await ctx.db.get("files", args.id)

        if (!file) {
            throw new Error("File not found")
        }

        const project = await ctx.db.get("projects", file.projectId)

        if (!project) {
            throw new Error("Project not found")
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized access to this project")
        }


        // Recursively delete all files and folders within the folder

        const deleteRecursive = async (fileId: Id<"files">) => {
            const item = await ctx.db.get("files", fileId)

            if (!item) return

            if (item.type === "folder") {
                const children = await ctx.db.query("files")
                    .withIndex("by_project_parent",
                        q =>
                            q.eq("projectId", item.projectId)
                                .eq("parentId", item._id)
                    )
                    .collect()

                for (const child of children) {
                    await deleteRecursive(child._id)
                }
            }

            if (item.storageId) {
                await ctx.storage.delete(item.storageId)
            }

            await ctx.db.delete("files", item._id)
        }

        await deleteRecursive(args.id)

        await ctx.db.patch("projects", file.projectId, {
            updatedAt: Date.now(),
        })
    },
})


export const updateFile = mutation({
    args: {
        id: v.id("files"),
        content: v.string(),
    },
    async handler(ctx, args) {
        const identity = await verifyAuth(ctx)

        const file = await ctx.db.get("files", args.id)

        if (!file) {
            throw new Error("File not found")
        }

        const project = await ctx.db.get("projects", file.projectId)

        if (!project) {
            throw new Error("Project not found")
        }

        if (project.ownerId !== identity.subject) {
            throw new Error("Unauthorized access to this project")
        }

        const now = Date.now()

        await ctx.db.patch("files", args.id, {
            content: args.content,
            updatedAt: now,
        })

        await ctx.db.patch("projects", file.projectId, {
            updatedAt: now,
        })
    },
})


