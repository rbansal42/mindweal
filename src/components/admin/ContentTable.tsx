"use client";

import Link from "next/link";
import { useState } from "react";

interface ContentItem {
  id: string;
  title?: string;
  name?: string;
  status: "draft" | "published";
  isActive: boolean;
  updatedAt: Date | string;
}

interface ContentTableProps {
  items: ContentItem[];
  basePath: string; // e.g., "/admin/programs"
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  titleField?: "title" | "name";
}

export function ContentTable({
  items,
  basePath,
  onToggleActive,
  onDelete,
  titleField = "title",
}: ContentTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentValue: boolean) => {
    setLoadingId(id);
    try {
      await onToggleActive(id, !currentValue);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setLoadingId(id);
    try {
      await onDelete(id);
    } finally {
      setLoadingId(null);
    }
  };

  const getTitle = (item: ContentItem) => {
    return titleField === "name" ? item.name : item.title;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {titleField === "name" ? "Name" : "Title"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {getTitle(item)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, item.isActive)}
                  disabled={loadingId === item.id}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                    item.isActive ? "bg-teal-600" : "bg-gray-200"
                  } ${loadingId === item.id ? "opacity-50" : ""}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      item.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(item.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Link
                  href={`${basePath}/${item.id}/edit`}
                  className="text-teal-600 hover:text-teal-900"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={loadingId === item.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items found. Create one to get started.
        </div>
      )}
    </div>
  );
}
