"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getRarities } from "@/lib/rarities-cache";

export default function BrainrotListItem({ brainrot }) {
  const [rarities, setRarities] = useState([]);

  useEffect(() => {
    async function fetchRarities() {
      try {
        const data = await getRarities();
        setRarities(data);
      } catch (error) {
        console.error("Error fetching rarities:", error);
      }
    }
    fetchRarities();
  }, []);

  const getRarityColor = (rarityId) => {
    const rarity = rarities.find(r => r.id === rarityId);
    return rarity?.color || '#9CA3AF';
  };

  const formatRarityName = (rarity) => {
    const safe = String(rarity || "");
    if (!safe) return "Unknown";
    return safe.charAt(0).toUpperCase() + safe.slice(1).replace('-', ' ');
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center">
        {brainrot.imageUrl && (
          <div className="flex-shrink-0 h-12 w-12 mr-4">
            <img 
              src={brainrot.imageUrl} 
              alt={brainrot.name}
              className="h-12 w-12 rounded-md object-cover" 
            />
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {brainrot?.name || "Untitled"}
          </h3>
          <div className="flex items-center mt-1">
            <span 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getRarityColor(brainrot?.rarity) }}
            >
              {formatRarityName(brainrot?.rarity)}
            </span>
            
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {Number(brainrot?.valueLGC) || 0} LGC
            </span>
            
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              Demand: {String(brainrot?.demand || "").replace('-', ' ') || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/brainrots/${brainrot.id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium font-urbanist text-[#020617] dark:text-white bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 hover:border-[#4F46E5]/50 transition-colors"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Link>
        
        <Link
          href={`/admin/brainrots/${brainrot.id}/delete`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium font-urbanist text-white bg-red-500 hover:bg-red-600 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </Link>
      </div>
    </div>
  );
}
