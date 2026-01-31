import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import type { AuthSession } from "@/types/auth";

const f = createUploadthing();

export const ourFileRouter = {
    therapistPhoto: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const session = await auth.api.getSession({ headers: req.headers }) as AuthSession | null;
            if (!session) throw new Error("Unauthorized");

            if (session.user.role !== "admin") throw new Error("Forbidden");

            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.ufsUrl);
            return { url: file.ufsUrl };
        }),

    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const session = await auth.api.getSession({ headers: req.headers }) as AuthSession | null;
            if (!session) throw new Error("Unauthorized");

            if (session.user.role !== "admin") throw new Error("Forbidden");

            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ file }) => {
            return { url: file.ufsUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
