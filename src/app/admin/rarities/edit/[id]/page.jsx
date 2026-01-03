"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import RarityForm from "@/components/Admin/RarityForm";

export default function EditRarityPage() {
  const params = useParams();
  const [rarity, setRarity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchRarity();
    }
  }, [params.id]);

  const fetchRarity = async () => {
    try {
      const res = await fetch(`/api/admin/rarities/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch rarity");
      const data = await res.json();
      setRarity(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-urbanist">{error}</p>
        </div>
      </div>
    );
  }

  return <RarityForm initialData={rarity} />;
}
