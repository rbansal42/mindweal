import { Metadata } from "next";
import BlogForm from "../BlogForm";

export const metadata: Metadata = {
    title: "New Blog Post | Admin | Mindweal by Pihu Suri",
};

export default function NewBlogPostPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="portal-title">Create Blog Post</h1>
                <p className="text-gray-600 text-sm mt-1">
                    Write and publish a new blog post
                </p>
            </div>

            <BlogForm mode="create" />
        </div>
    );
}
