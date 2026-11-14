'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowLeft, ArrowRight, ExternalLink, ChevronLeft, ChevronRight, X, Play, Pause, Volume2, VolumeX, Maximize2, Film, Video, Image as ImageIcon, Instagram, Linkedin, Mail, MessageCircle, MapPin, Phone, Send, Calendar, Wrench, Briefcase, Building2 } from 'lucide-react'
import { useContent } from '@/context/ContentContext'
import Navigation from '@/components/Navigation'
import CustomCursor from '@/components/CustomCursor'

// Interactive Hover & Touch Aware Video Card for 3-Column Grid
function ProjectVideoCard({
  item,
  aspectRatio = 'vertical',
  onExpand
}: {
  item: { url: string; caption?: string; id?: string },
  aspectRatio?: 'vertical' | 'horizontal',
  onExpand?: (url: string) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInView = useInView(cardRef, { amount: 0.5, once: false })
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Detect touch device (phone / tablet)
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Desktop hover play / pause
  const handleMouseEnter = () => {
    if (!isTouchDevice && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (!isTouchDevice && videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Mobile / Phone: Auto-play preview when scrolled into center of screen
  useEffect(() => {
    if (isTouchDevice && videoRef.current) {
      if (isInView) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }, [isInView, isTouchDevice])

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      const nextMuted = !isMuted
      videoRef.current.muted = nextMuted
      setIsMuted(nextMuted)
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
      className={`group relative overflow-hidden rounded-3xl bg-black border border-white/10 hover:border-accent-blue/50 transition-all duration-300 shadow-2xl cursor-pointer ${
        aspectRatio === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
      }`}
    >
      <video
        ref={videoRef}
        src={item.url}
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Dark gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none transition-opacity duration-300 ${
        isPlaying ? 'opacity-30 group-hover:opacity-50' : 'opacity-70'
      }`} />

      {/* Center Play Button indicator when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-accent-blue/80 transition-all">
            <Play className="w-6 h-6 ml-0.5 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Top Left: Status badge */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-medium text-white/90 border border-white/10 flex items-center gap-1.5 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`} />
          {isPlaying ? 'Playing' : (isTouchDevice ? 'Tap to Play' : 'Hover to Play')}
        </span>
      </div>

      {/* Top Right Controls: Mute/Unmute & Fullscreen */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
        <button
          onClick={toggleMute}
          className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-accent-blue" />}
        </button>
        {onExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onExpand(item.url)
            }}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-white/80" />
          </button>
        )}
      </div>

      {/* Bottom Bar: Caption & Play/Pause toggle */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-30 flex items-end justify-between gap-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
        <div className="flex-1 min-w-0">
          {item.caption ? (
            <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 drop-shadow-md">{item.caption}</p>
          ) : (
            <p className="text-white/60 text-[11px]">{isTouchDevice ? 'Tap to toggle playback' : 'Hover to preview'}</p>
          )}
        </div>
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-all shrink-0"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>
      </div>
    </div>
  )
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { content } = useContent()
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [prevProject, setPrevProject] = useState<any>(null)
  const [nextProject, setNextProject] = useState<any>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null)

  useEffect(() => {
    if (slug && content.projects?.items) {
      const project = content.projects.items.find((p: any) =>
        p.slug === slug || p.id === slug
      )
      setCurrentProject(project)

      if (project) {
        const projects = content.projects.items
        const currentIndex = projects.findIndex((p: any) =>
          p.slug === slug || p.id === slug
        )
        setPrevProject(currentIndex > 0 ? projects[currentIndex - 1] : null)
        setNextProject(currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null)
      }
    }
  }, [slug, content.projects?.items])

  if (!currentProject) {
    return (
      <>
        <CustomCursor />
        <Navigation />
        <main className="min-h-screen bg-dark pt-32 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Project Not Found</h1>
            <p className="text-white/50 mb-8">The project you're looking for doesn't exist.</p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue rounded-full text-white font-medium hover:bg-accent-purple transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>
          </div>
        </main>
      </>
    )
  }

  const socialLinks = [
    {
      icon: Instagram,
      label: 'Instagram',
      url: content.contact?.socials?.[0]?.url || '#',
      color: 'from-pink-500 to-purple-500'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      url: content.contact?.socials?.[1]?.url || '#',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Mail,
      label: 'Email',
      url: content.contact?.socials?.[2]?.url || `mailto:${content.settings?.email || 'darsh@example.com'}`,
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      url: content.contact?.socials?.[3]?.url || '#',
      color: 'from-green-500 to-emerald-500'
    },
  ]

  const handleSocialClick = (url: string) => {
    if (url.startsWith('mailto:')) {
      window.location.href = url
    } else if (url !== '#') {
      window.open(url, '_blank')
    }
  }

  const projectImage = currentProject.coverImage || currentProject.image
  const gallery = currentProject.gallery || []

  return (
    <>
      <CustomCursor />
      <Navigation />
      <main className="relative min-h-screen bg-dark pt-24">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-blue/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* Category & Featured Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-medium">
                {currentProject.category || 'Project'}
              </span>
              {currentProject.featured && (
                <span className="px-3 py-1 rounded-full bg-accent-purple/10 text-accent-purple text-sm font-medium">
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {currentProject.title}
            </h1>

            {/* Client */}
            <p className="text-xl text-white/60 mb-6">
              {currentProject.client}
            </p>

            {/* Cover Image */}
            {projectImage && (
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-8">
                <img
                  src={projectImage}
                  alt={currentProject.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
              </div>
            )}
          </motion.div>

          {/* Results Section */}
          {currentProject.results?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Results Achieved</h2>
              <div className="flex flex-wrap gap-3">
                {currentProject.results.map((result: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium"
                  >
                    {result}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Project Overview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid lg:grid-cols-3 gap-8 mb-12"
          >
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Full Description */}
              {currentProject.fullDescription && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Project Overview</h2>
                  <p className="text-white/70 leading-relaxed whitespace-pre-line">
                    {currentProject.fullDescription}
                  </p>
                </div>
              )}

              {/* Challenge */}
              {currentProject.challenge && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Business Challenge</h2>
                  <p className="text-white/70 leading-relaxed whitespace-pre-line">
                    {currentProject.challenge}
                  </p>
                </div>
              )}

              {/* Objectives */}
              {currentProject.objectives?.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Goals & Objectives</h2>
                  <ul className="space-y-3">
                    {currentProject.objectives.map((objective: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-white/70">
                        <span className="w-2 h-2 rounded-full bg-accent-blue mt-2" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Services Provided */}
              {currentProject.services?.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">Services Provided</h2>
                  <div className="flex flex-wrap gap-3">
                    {currentProject.services.map((service: string, i: number) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-full bg-accent-blue/10 text-accent-blue text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Project Info */}
            <div className="space-y-6">
              {/* Project Information */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
                <div className="space-y-4">
                  {currentProject.industry && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-accent-blue mt-0.5" />
                      <div>
                        <p className="text-white/40 text-sm">Industry</p>
                        <p className="text-white">{currentProject.industry}</p>
                      </div>
                    </div>
                  )}
                  {currentProject.timeline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-accent-purple mt-0.5" />
                      <div>
                        <p className="text-white/40 text-sm">Timeline</p>
                        <p className="text-white">{currentProject.timeline}</p>
                      </div>
                    </div>
                  )}
                  {currentProject.tools?.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-accent-blue mt-0.5" />
                      <div>
                        <p className="text-white/40 text-sm">Tools Used</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {currentProject.tools.map((tool: string, i: number) => (
                            <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-white/70 text-sm">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {currentProject.category && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-accent-purple mt-0.5" />
                      <div>
                        <p className="text-white/40 text-sm">Category</p>
                        <p className="text-white">{currentProject.category}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Project Media, Reels & Posts (3-Column Grid Layout) */}
          {((currentProject.verticalReels && currentProject.verticalReels.length > 0) ||
            (currentProject.horizontalReels && currentProject.horizontalReels.length > 0) ||
            currentProject.video ||
            gallery.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16 space-y-16"
            >
              {/* Section Header */}
              <div className="text-center">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-white">Media & Creatives</span>
                </h2>
                <p className="text-white/40 text-xs sm:text-sm max-w-xl mx-auto">
                  Interactive 3-column showcase of video reels, horizontal films, and creative campaign posts.
                </p>
              </div>

              {/* 1. Vertical Reels (9:16) - 3 Column Grid */}
              {currentProject.verticalReels && currentProject.verticalReels.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-purple-400" /> Vertical Reels (9:16)
                      </h3>
                      <p className="text-xs text-white/40 mt-1">
                        Hover with mouse to play • On phone, scroll into view or tap to play
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                      {currentProject.verticalReels.length} Reels
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProject.verticalReels.map((reel: any, idx: number) => {
                      const normalized = typeof reel === 'string' ? { url: reel } : reel
                      return (
                        <ProjectVideoCard
                          key={normalized.id || idx}
                          item={normalized}
                          aspectRatio="vertical"
                          onExpand={(url) => setActiveVideoModal(url)}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 2. Horizontal Videos (16:9) - 3 Column Grid */}
              {currentProject.horizontalReels && currentProject.horizontalReels.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-400" /> Horizontal Videos (16:9)
                      </h3>
                      <p className="text-xs text-white/40 mt-1">
                        Hover with mouse to play • On phone, scroll into view or tap to play
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                      {currentProject.horizontalReels.length} Videos
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProject.horizontalReels.map((reel: any, idx: number) => {
                      const normalized = typeof reel === 'string' ? { url: reel } : reel
                      return (
                        <ProjectVideoCard
                          key={normalized.id || idx}
                          item={normalized}
                          aspectRatio="horizontal"
                          onExpand={(url) => setActiveVideoModal(url)}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Legacy Single Video Fallback */}
              {(!currentProject.verticalReels || currentProject.verticalReels.length === 0) &&
               (!currentProject.horizontalReels || currentProject.horizontalReels.length === 0) &&
               currentProject.video && (
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Featured Project Video</h3>
                  <ProjectVideoCard
                    item={{ url: currentProject.video }}
                    aspectRatio="horizontal"
                    onExpand={(url) => setActiveVideoModal(url)}
                  />
                </div>
              )}

              {/* 3. Project Posts & Campaign Creatives (3-Column Grid) */}
              {gallery.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-accent-blue" /> Campaign Posts & Creative Assets
                      </h3>
                      <p className="text-xs text-white/40 mt-1">
                        High-converting promotional posts, posters, and campaign imagery
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                      {gallery.length} Posts
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.map((image: string, i: number) => (
                      <div
                        key={i}
                        className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-black/60 border border-white/10 hover:border-accent-blue/50 transition-all duration-300 shadow-2xl"
                        onClick={() => setLightboxImage(image)}
                      >
                        <img
                          src={image}
                          alt={`${currentProject.title} post ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-white font-medium">Creative Post {i + 1}</span>
                            <div className="w-9 h-9 rounded-full bg-accent-blue/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                              <ExternalLink className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Video Fullscreen Modal */}
          <AnimatePresence>
            {activeVideoModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                onClick={() => setActiveVideoModal(null)}
              >
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                  aria-label="Close video"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <video
                    src={activeVideoModal}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lightbox for Images */}
          <AnimatePresence>
            {lightboxImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                onClick={() => setLightboxImage(null)}
              >
                <button
                  className="absolute top-5 right-5 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50"
                  onClick={() => setLightboxImage(null)}
                  aria-label="Close image"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={lightboxImage}
                  alt="Lightbox"
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Previous / Next Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-between items-center py-8 border-t border-white/10 mb-12"
          >
            {prevProject ? (
              <Link
                href={`/projects/${prevProject.slug || prevProject.id}`}
                className="group flex items-center gap-4 text-white/60 hover:text-white transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-white/40">Previous</p>
                  <p className="font-medium">{prevProject.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextProject ? (
              <Link
                href={`/projects/${nextProject.slug || nextProject.id}`}
                className="group flex items-center gap-4 text-white/60 hover:text-white transition-colors text-right"
              >
                <div className="hidden md:block">
                  <p className="text-sm text-white/40">Next</p>
                  <p className="font-medium">{nextProject.title}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </Link>
            ) : (
              <div />
            )}
          </motion.div>

          {/* Contact Section */}
          <motion.div
            id="contact"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-20 border-t border-white/10"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Let&apos;s Work Together
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                Have a project in mind? Reach out and let&apos;s discuss how we can take your brand to the next level.
              </p>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 text-white/60">
                <Mail className="w-5 h-5" />
                <span>{content.settings?.email || 'darsh@example.com'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Phone className="w-5 h-5" />
                <span>{content.settings?.phone || '+91 1234567890'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <MapPin className="w-5 h-5" />
                <span>{content.settings?.location || 'Mumbai, India'}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4">
              {socialLinks.map((social, i) => (
                <button
                  key={i}
                  onClick={() => handleSocialClick(social.url)}
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center hover:scale-110 transition-transform`}
                  title={social.label}
                >
                  <social.icon className="w-5 h-5 text-white" />
                </button>
              ))}
            </div>

            {/* Contact Form */}
            <div className="max-w-xl mx-auto mt-16">
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const subject = encodeURIComponent(`Portfolio Inquiry from ${formData.get('name')}`)
                  const body = encodeURIComponent(`Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\n\nProject Details:\n${formData.get('message')}`)
                  window.location.href = `mailto:${content.settings?.email || 'darsh@example.com'}?subject=${subject}&body=${body}`
                }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/60 ml-1">Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-blue/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60 ml-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-blue/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60 ml-1">Project Details</label>
                  <textarea
                    name="message"
                    required
                    placeholder="Tell me about your project..."
                    rows={5}
                    className="w-full px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent-blue/50 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue bg-size-200 hover:bg-right transition-all duration-500 flex items-center justify-center gap-3 group"
                >
                  <span className="font-semibold text-white">Send Message</span>
                  <Send className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}