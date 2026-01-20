// frontend/src/app/admin/settings/specializations/SpecializationsManager.tsx
"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

interface Specialization {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
}

interface Props {
    initialSpecializations: Specialization[];
}

export default function SpecializationsManager({ initialSpecializations }: Props) {
    const [specializations, setSpecializations] = useState(initialSpecializations);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/specializations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add");

            setSpecializations([...specializations, data.specialization].sort((a, b) =>
                a.name.localeCompare(b.name)
            ));
            setNewName("");
            setIsAdding(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editingName.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/specializations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingName.trim() }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update");

            setSpecializations(specializations.map(s =>
                s.id === id ? { ...s, name: editingName.trim() } : s
            ).sort((a, b) => a.name.localeCompare(b.name)));
            setEditingId(null);
            setEditingName("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this specialization?")) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/admin/specializations/${id}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to delete");

            setSpecializations(specializations.filter(s => s.id !== id));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card p-6">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {specializations.map((spec) => (
                    <div key={spec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        {editingId === spec.id ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleUpdate(spec.id)}
                                    disabled={isLoading}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setEditingId(null); setEditingName(""); }}
                                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <span className="font-medium">{spec.name}</span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => { setEditingId(spec.id); setEditingName(spec.name); }}
                                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(spec.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {specializations.length === 0 && !isAdding && (
                    <p className="text-gray-500 text-center py-8">
                        No specializations yet. Add your first one below.
                    </p>
                )}
            </div>

            <div className="mt-4 pt-4 border-t">
                {isAdding ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g., Anxiety, Depression, Trauma"
                            className="flex-1 px-3 py-2 border rounded-lg"
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={isLoading || !newName.trim()}
                            className="btn btn-primary px-4 py-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                        </button>
                        <button
                            onClick={() => { setIsAdding(false); setNewName(""); }}
                            className="btn btn-outline px-4 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 text-[var(--primary-teal)] hover:underline"
                    >
                        <Plus className="w-4 h-4" />
                        Add Specialization
                    </button>
                )}
            </div>
        </div>
    );
}
