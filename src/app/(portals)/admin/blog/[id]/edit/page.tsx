import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDataSource } from "@/lib/db";
import { BlogPost } from "@/entities/BlogPost";
import BlogForm from "../../BlogForm";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getBlogPost(id: string) {
    const ds = await getDataSource();
    const repo = ds.getRepository(BlogPost);

    const post = await repo.findOne({
        where: { id },
        relations: ["author"],
    });

    return post;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: "Edit Blog Post | Admin | Mindweal by Pihu Suri",
    };
}

export default async function EditBlogPostPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getBlogPost(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="portal-title">Edit Blog Post</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Update blog post content and settings
                </p>
            </div>

            <BlogForm mode="edit" initialData={post} />
        </div>
    );
}
