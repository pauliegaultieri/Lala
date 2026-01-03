"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Calendar, User } from "lucide-react";
import { FadeIn } from "@/components/Animations";

export default function GuideViewPage() {
  const params = useParams();
  const router = useRouter();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.slug) {
      fetchGuide();
    }
  }, [params.slug]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/guides/${params.slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Guide not found");
        } else {
          setError("Failed to load guide");
        }
        return;
      }
      const data = await res.json();
      setGuide(data);
    } catch (err) {
      console.error("Error fetching guide:", err);
      setError("Failed to load guide");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-pp-mori">
            {error || "Guide not found"}
          </h1>
          <button
            type="button"
            onClick={() => router.push("/guides")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-urbanist font-medium cursor-pointer"
          >
            Back to Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 transition-colors">
      <article className="w-full px-4 sm:px-6 md:px-8 lg:px-16 py-10 sm:py-14 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <FadeIn duration={0.4} distance={20}>
            <button
              type="button"
              onClick={() => router.push("/guides")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 font-urbanist transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
              Back to Guides
            </button>
          </FadeIn>

          {/* Cover Image */}
          {guide.coverImage && (
            <FadeIn delay={0.1} duration={0.6} distance={25}>
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img 
                  src={guide.coverImage} 
                  alt={guide.title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            </FadeIn>
          )}

          {/* Tag */}
          {guide.tag && (
            <FadeIn delay={0.15} duration={0.5} distance={15}>
              <div className="mb-4">
                <span className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium font-urbanist">
                  {guide.tag}
                </span>
              </div>
            </FadeIn>
          )}

          {/* Title */}
          <FadeIn delay={0.2} duration={0.6} distance={20}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-pp-mori">
              {guide.title}
            </h1>
          </FadeIn>

          {/* Description */}
          {guide.description && (
            <FadeIn delay={0.25} duration={0.5} distance={15}>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 font-urbanist">
                {guide.description}
              </p>
            </FadeIn>
          )}

          {/* Author & Date Info */}
          <FadeIn delay={0.3} duration={0.5} distance={15}>
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-gray-200 dark:border-slate-800">
              {/* Author */}
              {guide.author && (
                <div className="flex items-center gap-3">
                  {guide.author.avatar && (
                    <img 
                      src={guide.author.avatar} 
                      alt={guide.author.displayName}
                      className="w-10 h-10 rounded-full border-2 border-indigo-600"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-urbanist">
                      <User size={14} />
                      <span>Written by</span>
                    </div>
                    <div className="text-base font-medium text-gray-900 dark:text-white font-urbanist">
                      {guide.author.displayName}
                    </div>
                  </div>
                </div>
              )}

              {/* Published Date */}
              {guide.publishedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-urbanist">
                  <Calendar size={16} />
                  <span>{formatDate(guide.publishedAt)}</span>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Content */}
          <FadeIn delay={0.35} duration={0.6} distance={20}>
            <div 
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-pp-mori prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-p:font-urbanist prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-gray-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-gray-100 dark:prose-pre:bg-slate-800
                prose-img:rounded-lg prose-img:shadow-lg
                prose-blockquote:border-indigo-600 dark:prose-blockquote:border-indigo-400
                prose-ul:font-urbanist prose-ol:font-urbanist
                prose-li:text-gray-700 dark:prose-li:text-gray-300"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />
          </FadeIn>

          {/* Updated Date */}
          {guide.updatedAt && guide.updatedAt !== guide.publishedAt && (
            <FadeIn delay={0.4} duration={0.5} distance={15}>
              <div className="mt-12 pt-6 border-t border-gray-200 dark:border-slate-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-urbanist italic">
                  Last updated: {formatDate(guide.updatedAt)}
                </p>
              </div>
            </FadeIn>
          )}

          {/* Back to Guides Button */}
          <FadeIn delay={0.45} duration={0.5} distance={15}>
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => router.push("/guides")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-urbanist font-medium cursor-pointer"
              >
                View All Guides
              </button>
            </div>
          </FadeIn>
        </div>
      </article>
    </div>
  );
}
