import React, { useMemo, useState } from 'react';
import {
  ArrowUp,
  Code2,
  ExternalLink,
  FolderGit2,
  Plus,
  Search,
  Trophy,
  X,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { ProjectItem } from '../types';

const TRACKS: ('All' | ProjectItem['track'])[] = [
  'All',
  'AI & ML',
  'Web & Full-Stack',
  'IoT & Hardware',
  'Developer Tools',
];

export const ProjectsView: React.FC = () => {
  const { projects, toggleProjectUpvote, submitProject, team } = useArgon();
  const [selectedTrack, setSelectedTrack] = useState<'All' | ProjectItem['track']>('All');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [track, setTrack] = useState<ProjectItem['track']>('Web & Full-Stack');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('React, TypeScript, Tailwind');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (selectedTrack !== 'All' && p.track !== selectedTrack) return false;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.teamName.toLowerCase().includes(q) &&
        !p.techStack.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [projects, selectedTrack, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    submitProject({
      title,
      track,
      description,
      techStack: techInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      repoUrl,
      demoUrl,
    });
    setTitle('');
    setDescription('');
    setRepoUrl('');
    setDemoUrl('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header & Submit CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#000000] tracking-[-0.02em]">
            Student Projects Showcase
          </h2>
          <p className="text-xs sm:text-sm text-[#4C4841]">
            Submit your hackathon MVP or club build to earn +250 XP.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="argon-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold self-start sm:self-auto whitespace-nowrap cursor-pointer"
        >
          <Plus size={15} />
          <span>Submit Project</span>
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {TRACKS.map((tr) => (
            <button
              key={tr}
              type="button"
              onClick={() => setSelectedTrack(tr)}
              className={`px-3 py-1.5 rounded-[11px] text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 border-[1.25px] border-[#000000] ${
                selectedTrack === tr
                  ? 'bg-[#000000] text-[#F6F4F1]'
                  : 'bg-[#F6F4F1] text-[#000000]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4841]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, team, stack..."
            className="w-full h-9 pl-9 pr-3 rounded-[11px] bg-[#F6F4F1] border-[1.25px] border-[#000000] text-xs text-[#000000] focus:outline-none"
          />
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="argon-card p-8 sm:p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-[14px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto">
            <Code2 size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#000000]">
            {projects.length === 0
              ? 'No projects submitted yet'
              : 'No projects match your current filter'}
          </h3>
          <p className="text-xs sm:text-sm text-[#4C4841] max-w-md mx-auto">
            {projects.length === 0
              ? 'Be the first team to publish a prototype with your GitHub repository and live preview link.'
              : 'Reset your track filter or search query to see all submitted projects.'}
          </p>
          {projects.length === 0 ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="argon-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Submit First Project</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedTrack('All');
                setQuery('');
              }}
              className="text-xs font-bold text-[#F95C4B] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filtered.map((proj) => (
            <article
              key={proj.id}
              className="argon-card p-4 sm:p-6 flex flex-col justify-between gap-3.5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-semibold text-[#4C4841] truncate">
                      <span className="text-[#000000]">{proj.teamName}</span> · {proj.track} ·{' '}
                      {proj.submittedDate}
                    </p>
                    <h3 className="mt-1 text-[16px] sm:text-[17px] font-bold text-[#000000] flex items-center gap-1.5">
                      <span className="truncate">{proj.title}</span>
                      {proj.status === 'Hackathon Winner' && (
                        <Trophy size={15} className="text-[#F95C4B] shrink-0" />
                      )}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleProjectUpvote(proj.id)}
                    className={`flex flex-col items-center justify-center min-w-[44px] py-1.5 px-2 rounded-[10px] border-[1.25px] border-[#000000] transition-colors cursor-pointer shrink-0 ${
                      proj.upvoted
                        ? 'bg-[#F95C4B] text-[#F6F4F1]'
                        : 'bg-[#F6F4F1] text-[#000000]'
                    }`}
                    aria-label={`Upvote ${proj.title}`}
                  >
                    <ArrowUp size={13} />
                    <span className="font-mono text-xs font-bold tabular-nums">{proj.upvotes}</span>
                  </button>
                </div>

                <p className="mt-2.5 text-xs sm:text-sm text-[#3A3732] leading-relaxed">
                  {proj.description}
                </p>

                <p className="mt-2.5 text-[11.5px] font-mono text-[#4C4841] truncate">
                  Stack: {proj.techStack.join(' · ')}
                </p>
              </div>

              <div className="pt-3 border-t border-[#000000]/15 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-[#000000]">
                  {proj.status} · +{proj.xpAwarded} XP
                </span>
                <div className="flex items-center gap-3">
                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#000000] hover:text-[#F95C4B]"
                    >
                      <FolderGit2 size={14} />
                      <span>Repo</span>
                    </a>
                  )}
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#F95C4B] hover:underline"
                    >
                      <ExternalLink size={14} />
                      <span>Live</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Submit Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/55 overflow-y-auto">
          <form onSubmit={handleSubmit} className="argon-card max-w-lg w-full p-5 sm:p-6 space-y-3.5 my-auto">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[11px] bg-[#000000] text-[#F95C4B] flex items-center justify-center shrink-0">
                  <Code2 size={18} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#000000]">Submit Project</h4>
                  <p className="text-xs text-[#4C4841]">
                    Submitting as {team.id ? team.name : 'Solo Member'} · +250 XP
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#000000] hover:bg-[#F6F4F1] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#000000] mb-1">Project Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Smart Attendance QR Hub"
                className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">Track</label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value as ProjectItem['track'])}
                  className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] focus:outline-none"
                >
                  <option value="AI & ML">AI & ML</option>
                  <option value="Web & Full-Stack">Web & Full-Stack</option>
                  <option value="IoT & Hardware">IoT & Hardware</option>
                  <option value="Developer Tools">Developer Tools</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#000000] mb-1">
                Problem &amp; Solution Summary
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your prototype solves..."
                className="w-full p-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#000000] mb-1">Live URL</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-bold text-[#000000] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="argon-btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Publish (+250 XP)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
