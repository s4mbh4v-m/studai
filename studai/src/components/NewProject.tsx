import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { analyzeAcademicTask } from '../lib/api';
import { addProject, getStudentProfile } from '../lib/storage';
import { AcademicProject, ProjectAnalysis } from '../types';

interface NewProjectProps {
  onProjectCreated: (project: AcademicProject) => void;
  onCancel: () => void;
}

export const NewProject: React.FC<NewProjectProps> = ({ onProjectCreated, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'upload'>('text');
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [deadline, setDeadline] = useState('2026-09-20');
  const [prompt, setPrompt] = useState('');
  const [instructions, setInstructions] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset academic samples for instant demonstration
  const SAMPLES = [
    {
      title: 'Financial Analysis Assignment',
      course: 'Financial Engineering',
      deadline: '2026-09-18',
      prompt:
        'Analyze Apple Inc. (AAPL) vs. Microsoft (MSFT) 3-year financial performance using liquidity, solvency, profitability, and asset efficiency ratios. Provide an analytical interpretation of the trends and derive strategic executive conclusions.',
      instructions:
        'Ground all figures in official 10-K filings. The core grade weighting assesses the qualitative rationale for margin shifts rather than pure calculation.',
    },
    {
      title: 'Distributed Consensus Protocol Formal Verification',
      course: 'Advanced Computer Systems',
      deadline: '2026-09-24',
      prompt:
        'Formulate a safety and liveness proof for a modified Raft consensus protocol under partial network partitions. Provide an invariant analysis and evaluate Byzantine fault vulnerabilities.',
      instructions:
        'Include state-transition diagrams and explicitly prove that split-brain conditions cannot occur during leader election transitions.',
    },
    {
      title: 'CRISPR Gene Editing Regulatory Governance',
      course: 'Bioethics & Health Policy',
      deadline: '2026-09-22',
      prompt:
        'Critically evaluate the international regulatory divergence between EMA (Europe) and FDA (USA) regarding germline CRISPR modifications. Synthesize human rights declarations with health economics.',
      instructions:
        'Focus on distributive justice frameworks and intellectual property barriers in low-income clinical deployments.',
    },
  ];

  const handleSelectSample = (sample: (typeof SAMPLES)[0]) => {
    setTitle(sample.title);
    setCourse(sample.course);
    setDeadline(sample.deadline);
    setPrompt(sample.prompt);
    setInstructions(sample.instructions);
    setActiveTab('text');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPrompt(
          `Extracted from uploaded syllabus/rubric (${file.name}):\n\n` +
            content.slice(0, 1500)
        );
      } else {
        setPrompt(`Assignment document "${file.name}" uploaded for multi-step academic decomposition.`);
      }
    };
    reader.readAsText(file.slice(0, 10000));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !title.trim()) return;

    setIsAnalyzing(true);
    try {
      const currentProfile = getStudentProfile();
      const analysis: ProjectAnalysis = await analyzeAcademicTask({
        title: title.trim() || 'Academic Project',
        course: course.trim() || 'University Course',
        prompt: prompt.trim(),
        instructions: instructions.trim(),
        deadline,
        studentProfile: currentProfile,
      });

      const newProj: AcademicProject = {
        id: 'proj-' + Date.now(),
        title: analysis.projectTitle || title.trim() || 'Academic Project',
        course: course.trim() || 'University Studies',
        deadline,
        rawPrompt: prompt,
        uploadedFileName: uploadedFileName || undefined,
        instructions: instructions.trim() || undefined,
        createdAt: new Date().toISOString(),
        status: 'ready_for_mode',
        analysis,
        missions: [],
        currentMissionIndex: 0,
        totalXpEarned: 0,
      };

      addProject(newProj);
      onProjectCreated(newProj);
    } catch (err) {
      console.error('Failed to create and analyze project:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Academic Task Ingestion & Cognitive Decomposition
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          New Academic Task
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Upload your assignment sheet or describe what you need to accomplish. StudAI will isolate
          mechanical requirements from high-value learning objectives.
        </p>
      </div>

      {/* Preset Academic Demonstrations Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            Quick Demo Presets:
          </span>
          <span className="text-[11px] text-slate-500">1-click populated</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all text-xs group"
            >
              <div className="font-semibold text-slate-900 group-hover:text-indigo-600 truncate">
                {s.title}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">{s.course}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Ingestion Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Method Toggle: Paste Text vs Upload File */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            Paste / Type Assignment
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            Upload Document (PDF, DOCX, TXT)
          </button>
        </div>

        {/* Input Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700">Course / Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Financial Engineering"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
            />
          </div>

          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700">Project / Assignment Title</label>
            <input
              type="text"
              placeholder="e.g. Financial Analysis Assignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
            />
          </div>

          <div className="space-y-1 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Dynamic Ingestion Area */}
        {activeTab === 'upload' ? (
          <div className="space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.docx,.txt,.md"
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Drop assignment sheet here or click to browse'}
              </p>
              <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, TXT syllabus and problem sets</p>
            </div>

            {uploadedFileName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Document successfully loaded and queued for cognitive classification.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Assignment or Academic Task Details *
              </label>
              <span className="text-[11px] text-slate-400">Describe or paste syllabus text</span>
            </div>
            <textarea
              required
              rows={5}
              placeholder="Upload your assignment or tell me what you need to accomplish..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-3.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all leading-relaxed"
            />
          </div>
        )}

        {/* Optional Rubric / Guidance */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Optional Instructions / Professor Guidelines
          </label>
          <input
            type="text"
            placeholder="e.g. Focus on Dupont analysis; avoid simple descriptive arithmetic; 1500 words max."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            id="submit-academic-task-btn"
            disabled={isAnalyzing || (!prompt.trim() && !title.trim())}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Learning Objectives...
              </>
            ) : (
              <>
                Analyze Academic Task
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
