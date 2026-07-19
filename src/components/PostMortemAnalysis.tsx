import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, BarChart3, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface PostMortemProps {
  lang: 'ar' | 'en';
}

export const PostMortemAnalysis: React.FC<PostMortemProps> = ({ lang }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bot/post-mortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang })
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Post-mortem analysis failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              {lang === 'ar' ? 'التوثيق والمراجعة (Post-Mortem)' : 'Post-Mortem Analysis'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'ar' ? 'تحليل الصفقات الخاسرة بالذكاء الاصطناعي' : 'AI Analysis of losing trades'}
            </p>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-medium"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <BarChart3 className="w-4 h-4" />
          )}
          {lang === 'ar' ? 'بدء التحليل' : 'Run Analysis'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800"
          >
            <div className="markdown-body">
              <Markdown>{analysis}</Markdown>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              {lang === 'ar' 
                ? 'انقر على "بدء التحليل" لاستخراج بيانات الصفقات الخاسرة وتحليل أسباب الفشل عبر Gemini API.' 
                : 'Click "Run Analysis" to extract losing trade data and analyze failure patterns via Gemini API.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
