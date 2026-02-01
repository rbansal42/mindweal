"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateClientProfileSchema, type UpdateClientProfileInput } from "@/lib/validation";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateClientProfileInput>({
    resolver: zodResolver(updateClientProfileSchema),
  });

  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/admin/clients/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch client");
        }
        const data = await res.json();
        setClientName(data.data.client.name);
        reset({
          emergencyContactName: data.data.profile.emergencyContactName,
          emergencyContactPhone: data.data.profile.emergencyContactPhone,
          emergencyContactRelationship: data.data.profile.emergencyContactRelationship,
          consentFormSigned: data.data.profile.consentFormSigned,
        });
      } catch (err) {
        setError("Failed to load client data");
        console.error("Fetch client error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [id, reset]);

  const onSubmit = async (data: UpdateClientProfileInput) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      router.push(`/admin/clients/${id}`);
    } catch (err: any) {
      setError(err.message);
      console.error("Update profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="portal-card p-8 text-center text-gray-500">
          Loading client data...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <Link
          href={`/admin/clients/${id}`}
          className="text-sm text-gray-600 hover:text-primary mb-2 inline-block"
        >
          ← Back to Client
        </Link>
        <h1 className="portal-title">Edit Client Profile - {clientName}</h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="portal-card p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Emergency Contact */}
        <div className="portal-card p-4 space-y-4">
          <h2 className="font-semibold">Emergency Contact Information</h2>

          <div>
            <label htmlFor="emergencyContactName" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              id="emergencyContactName"
              type="text"
              {...register("emergencyContactName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Contact name"
            />
            {errors.emergencyContactName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.emergencyContactName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContactPhone" className="block text-sm font-medium mb-1">
              Phone
            </label>
            <input
              id="emergencyContactPhone"
              type="text"
              {...register("emergencyContactPhone")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+1234567890"
            />
            {errors.emergencyContactPhone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.emergencyContactPhone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium mb-1">
              Relationship
            </label>
            <input
              id="emergencyContactRelationship"
              type="text"
              {...register("emergencyContactRelationship")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Spouse, Parent, Sibling"
            />
            {errors.emergencyContactRelationship && (
              <p className="text-sm text-red-600 mt-1">
                {errors.emergencyContactRelationship.message}
              </p>
            )}
          </div>
        </div>

        {/* Consent */}
        <div className="portal-card p-4">
          <h2 className="font-semibold mb-4">Consent Status</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("consentFormSigned")}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm">Consent form signed and verified</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Link
            href={`/admin/clients/${id}`}
            className="portal-btn portal-btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="portal-btn portal-btn-primary"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
