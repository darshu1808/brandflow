'use client'
// Admin Panel - Content Management System
import React, { useState, useEffect, useRef } from 'react'
import { Save, Eye, Plus, Trash2, Upload, X, Image, Video, Film, Settings, Briefcase, Building, Layers, Palette, FileText, Link, Copy, RefreshCw, Loader2, Volume2, VolumeX, FolderOpen, Lock, Loader, Calendar } from 'lucide-react'

const CLOUDINARY_CLOUD_NAME = 'dgkyqmres'

// Cloudinary upload function
async function uploadToCloudinary(file: File, resourceType: 'video' | 'image'): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'portfolio_unsigned')
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME)

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = await response.json()
  return data.secure_url
}

const defaultContent = {
  hero: {
    tagline: "AI-Powered Marketing Strategy",
    title: { line1: "Creative", line2: "Growth", line3: "Strategist" },
    subtitle: "Transforming brands through data-driven strategies, AI-powered marketing, and creative storytelling that scales.",
    cta: { primary: "View Projects", secondary: "Let's Talk" },
    stats: [
      { value: "2+", label: "Years Experience" },
      { value: "50+", label: "Campaigns" },
      { value: "10M+", label: "Reach" },
      { value: "200%", label: "Avg Growth" }
    ]
  },
  about: {
    tagline: "About Me",
    title: "Building Brands with Intelligence & Creativity",
    description: "I'm a digital marketer and creative growth strategist who combines data-driven insights with bold creative vision.",
    profileImage: "",
    stats: [
      { value: "2+", label: "Years" },
      { value: "50+", label: "Campaigns" },
      { value: "10M+", label: "Reach" }
    ],
    skills: ["Meta Ads", "Content Strategy", "AI Automation", "Creative Direction", "Data Analytics"]
  },
  services: {
    tagline: "Services",
    title: "What I Do",
    description: "Comprehensive digital solutions designed to elevate your brand and drive measurable growth.",
    items: [
      { icon: "Share2", title: "Social Media Management", desc: "End-to-end community building.", color: "#00C2FF" },
      { icon: "PenTool", title: "Content Strategy", desc: "Data-driven content pillars.", color: "#6D5EF3" },
      { icon: "Target", title: "Meta Ads", desc: "Precision-targeted campaigns.", color: "#00C2FF" },
      { icon: "Wand2", title: "Creative Direction", desc: "Visual storytelling.", color: "#6D5EF3" },
      { icon: "Bot", title: "AI Automation", desc: "Cutting-edge AI workflows.", color: "#00C2FF" },
      { icon: "TrendingUp", title: "Growth Strategy", desc: "Comprehensive roadmaps.", color: "#6D5EF3" }
    ]
  },
  skills: {
    tagline: "Expertise",
    title: "Skills & Capabilities",
    description: "A curated set of skills designed to deliver exceptional results.",
    items: [
      { name: "Meta Ads", value: 95, color: "#00C2FF" },
      { name: "Content Strategy", value: 90, color: "#6D5EF3" },
      { name: "Creative Direction", value: 85, color: "#00C2FF" },
      { name: "AI Automation", value: 92, color: "#6D5EF3" },
      { name: "Data Analytics", value: 88, color: "#00C2FF" },
      { name: "Copywriting", value: 85, color: "#6D5EF3" }
    ]
  },
  testimonials: {
    tagline: "Testimonials",
    title: "Client Success",
    items: [
      { name: "Sarah J.", role: "Founder, Aura", text: "Darsh completely transformed our social presence.", gradient: "from-[#00C2FF] to-[#6D5EF3]", profileImage: "" },
      { name: "Michael T.", role: "CMO, Nexus", text: "The AI workflow integration saved our team 20 hours a week.", gradient: "from-[#6D5EF3] to-[#00C2FF]", profileImage: "" },
      { name: "Elena R.", role: "Director, TechNova", text: "Our launch reached over a million people organically.", gradient: "from-[#00C2FF] to-[#6D5EF3]", profileImage: "" }
    ]
  },
  workflow: {
    tagline: "Process",
    title: "How I Work",
    description: "A streamlined AI-powered workflow designed to deliver results efficiently.",
    steps: [
      { icon: "Lightbulb", label: "Discovery", desc: "Understanding your brand" },
      { icon: "FileText", label: "Strategy", desc: "Creating the roadmap" },
      { icon: "Palette", label: "Creative", desc: "Designing assets" },
      { icon: "Video", label: "Production", desc: "Content creation" },
      { icon: "Rocket", label: "Launch", desc: "Going live" },
      { icon: "BarChart3", label: "Optimize", desc: "Scaling results" }
    ]
  },
  timeline: {
    tagline: "Journey",
    title: "My Timeline",
    description: "A chronological journey through my education and professional experience.",
    items: [
      { year: "2024", type: "job", title: "Digital Marketing Lead", subtitle: "TechNova Inc.", description: "Leading digital marketing strategies for tech startups." },
      { year: "2022", type: "job", title: "Social Media Manager", subtitle: "Aura Lifestyle", description: "Managed social media presence for fashion brand." },
      { year: "2020", type: "education", title: "Digital Marketing Certification", subtitle: "Google & Meta", description: "Certified in Google Ads and Meta Marketing." }
    ]
  },
  contact: {
    tagline: "Contact",
    title: "Let's build something extraordinary",
    description: "Have a project in mind? Let's discuss how we can take your brand to the next level.",
    socials: [
      { icon: "Instagram", label: "Instagram", url: "https://instagram.com/" },
      { icon: "Linkedin", label: "LinkedIn", url: "https://linkedin.com/in/" },
      { icon: "Mail", label: "Email", url: "mailto:darsh@example.com" },
      { icon: "MessageCircle", label: "WhatsApp", url: "https://wa.me/" }
    ]
  },
  projects: {
    tagline: "Portfolio",
    title: "Featured Work",
    description: "A collection of projects showcasing my expertise in digital marketing and creative strategy.",
    items: [
      { id: "1", slug: "brand-campaign", title: "Brand Campaign", client: "Tech Startup", category: "Social Media", description: "Complete social media overhaul resulting in 300% growth.", fullDescription: "", challenge: "", objectives: [], services: [], industry: "Technology", timeline: "3 months", tools: [], image: "", coverImage: "", video: "", verticalReels: [], horizontalReels: [], gallery: [], results: ["300% Growth", "1M+ Reach"], featured: true }
    ]
  },
  brands: {
    tagline: "Brands",
    title: "I've Worked With",
    description: "Trusted by leading brands across industries.",
    items: [
      { id: "1", name: "Brand Name", logo: "", website: "" }
    ]
  },
  media: {
    gallery: []
  },
  contentShowcase: {
    labels: {
      verticalReels: "Vertical Videos",
      horizontalReels: "Horizontal Videos",
      verticalPosts: "Vertical Posts",
      horizontalPosts: "Horizontal Posts"
    },
    verticalReels: [],
    horizontalReels: [],
    verticalPosts: [],
    horizontalPosts: []
  },
  reels: {
    tagline: "Reels",
    title: "Watch My Work",
    description: "Latest Instagram Reels showcasing creative content and campaigns.",
    items: [
      { id: "1", url: "", caption: "", views: "" }
    ]
  },
  settings: {
    siteName: "Darsh Pandav",
    siteTitle: "Digital Marketer & Growth Strategist",
    email: "darsh@example.com",
    phone: "+91 1234567890",
    location: "Mumbai, India",
    primaryColor: "#00C2FF",
    secondaryColor: "#6D5EF3"
  }
}

export default function AdminPanel() {
  const [content, setContent] = useState(defaultContent)
  const [activeSection, setActiveSection] = useState('hero')
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [activeTab, setActiveTab] = useState('content')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Password protection - change this to your desired password
  const ADMIN_PASSWORD = 'Darsh@1808'

  // Check for existing session AND automatically load latest published content from server
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check auth session
    const adminSession = localStorage.getItem('adminSession')
    if (adminSession === 'authenticated') {
      setIsAuthenticated(true)
    }

    // Automatically load the latest content from published content.json
    const loadLatestContent = async () => {
      try {
        const response = await fetch(`/data/content.json?t=${Date.now()}`)
        if (response.ok) {
          const fileContent = await response.json()
          const complete = {
            ...defaultContent,
            ...fileContent,
            hero: { ...defaultContent.hero, ...(fileContent.hero || {}), stats: fileContent.hero?.stats || defaultContent.hero.stats || [] },
            about: { ...defaultContent.about, ...(fileContent.about || {}), skills: fileContent.about?.skills || defaultContent.about.skills || [] },
            services: { ...defaultContent.services, ...(fileContent.services || {}), items: fileContent.services?.items || defaultContent.services.items || [] },
            skills: { ...defaultContent.skills, ...(fileContent.skills || {}), items: fileContent.skills?.items || defaultContent.skills.items || [] },
            testimonials: { ...defaultContent.testimonials, ...(fileContent.testimonials || {}), items: fileContent.testimonials?.items || defaultContent.testimonials.items || [] },
            workflow: { ...defaultContent.workflow, ...(fileContent.workflow || {}), steps: fileContent.workflow?.steps || defaultContent.workflow.steps || [] },
            timeline: { ...defaultContent.timeline, ...(fileContent.timeline || {}), items: fileContent.timeline?.items || defaultContent.timeline.items || [] },
            contact: { ...defaultContent.contact, ...(fileContent.contact || {}), socials: fileContent.contact?.socials || defaultContent.contact.socials || [] },
            settings: { ...defaultContent.settings, ...(fileContent.settings || {}) },
            brands: fileContent.brands || defaultContent.brands,
            media: fileContent.media || defaultContent.media,
            projects: fileContent.projects || defaultContent.projects,
            contentShowcase: fileContent.contentShowcase || defaultContent.contentShowcase
          }
          setContent(complete)
          localStorage.setItem('portfolioContent', JSON.stringify(complete))
          setIsLoaded(true)
          return
        }
      } catch (e) {
        console.warn('Could not auto-fetch /data/content.json, using local backup:', e)
      }

      // Fallback to localStorage if offline
      const savedContent = localStorage.getItem('portfolioContent')
      if (savedContent) {
        try {
          const parsed = JSON.parse(savedContent)
          const complete = {
            ...defaultContent,
            ...parsed,
            hero: { ...defaultContent.hero, ...(parsed.hero || {}), stats: parsed.hero?.stats || defaultContent.hero.stats || [] },
            about: { ...defaultContent.about, ...(parsed.about || {}), skills: parsed.about?.skills || defaultContent.about.skills || [] },
            services: { ...defaultContent.services, ...(parsed.services || {}), items: parsed.services?.items || defaultContent.services.items || [] },
            skills: { ...defaultContent.skills, ...(parsed.skills || {}), items: parsed.skills?.items || defaultContent.skills.items || [] },
            testimonials: { ...defaultContent.testimonials, ...(parsed.testimonials || {}), items: parsed.testimonials?.items || defaultContent.testimonials.items || [] },
            workflow: { ...defaultContent.workflow, ...(parsed.workflow || {}), steps: parsed.workflow?.steps || defaultContent.workflow.steps || [] },
            timeline: { ...defaultContent.timeline, ...(parsed.timeline || {}), items: parsed.timeline?.items || defaultContent.timeline.items || [] },
            contact: { ...defaultContent.contact, ...(parsed.contact || {}), socials: parsed.contact?.socials || defaultContent.contact.socials || [] },
            settings: { ...defaultContent.settings, ...(parsed.settings || {}) },
            brands: parsed.brands || defaultContent.brands,
            media: parsed.media || defaultContent.media,
            projects: parsed.projects || defaultContent.projects,
            contentShowcase: parsed.contentShowcase || defaultContent.contentShowcase
          }
          setContent(complete)
        } catch (e) {
          console.error('Error loading fallback content:', e)
        }
      }
      setIsLoaded(true)
    }

    loadLatestContent()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('adminSession', 'authenticated')
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('adminSession')
    setPassword('')
  }

  // Show loading while checking session
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Portfolio Admin</h1>
              <p className="text-gray-400 text-sm mt-2">Enter your password to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              {authError && (
                <p className="text-red-400 text-sm text-center">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-semibold transition-all"
              >
                Login
              </button>
            </form>
            <div className="mt-6 text-center">
              <a href="/" className="text-gray-400 text-sm hover:text-white">← Back to Site</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = async (pushToGit: boolean = true) => {
    try {
      setIsPushing(true)

      // 1. Save to localStorage as browser cache
      localStorage.setItem('portfolioContent', JSON.stringify(content))

      // 2. Write directly to content.json files on disk or GitHub via API
      const res = await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, pushToGit })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      setSaved(true)
      setSaveMessage('Published Live!')
      setTimeout(() => {
        setSaved(false)
        setSaveMessage('')
      }, 3500)

      if (data.gitWarning) {
        alert(data.message)
      }
    } catch (e: any) {
      console.error('Save error:', e)
      alert('Error saving: ' + (e?.message || 'Check connection'))
    } finally {
      setIsSaving(false)
      setIsPushing(false)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(content, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'portfolio-content.json'
    link.click()
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          setContent(imported)
          localStorage.setItem('portfolioContent', JSON.stringify(imported))
          alert('Content imported successfully!')
        } catch (err) {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleReset = () => {
    if (confirm('Reset to default content? All changes will be lost.')) {
      setContent(defaultContent)
      localStorage.setItem('portfolioContent', JSON.stringify(defaultContent))
    }
  }

  // Load content from content.json file
  const handleLoadFromFile = async () => {
    if (!confirm('Load content from content.json file? This will load all your existing site content into the admin panel. Your local changes will be overwritten!')) {
      return
    }

    try {
      const response = await fetch('/data/content.json')
      if (!response.ok) {
        throw new Error('Failed to load content.json')
      }
      const fileContent = await response.json()

      // Merge with default content structure to ensure all fields exist
      const mergedContent = {
        ...defaultContent,
        ...fileContent,
        brands: fileContent.brands || defaultContent.brands,
        media: fileContent.media || defaultContent.media,
        projects: fileContent.projects || defaultContent.projects,
        settings: fileContent.settings || defaultContent.settings,
        contentShowcase: fileContent.contentShowcase || defaultContent.contentShowcase
      }

      setContent(mergedContent)
      localStorage.setItem('portfolioContent', JSON.stringify(mergedContent))
      alert('Content loaded from file successfully!')
    } catch (error) {
      console.error('Error loading content:', error)
      alert('Failed to load content.json. Make sure the file exists in public/data/ folder.')
    }
  }

  const handleSyncFromFile = () => {
    if (confirm('Sync from content.json? This will reload all content from the file (GitHub version). Save your current work first by clicking Export!')) {
      localStorage.removeItem('portfolioContent')
      alert('Local storage cleared! Please refresh the page to load content from content.json')
    }
  }

  const updateField = (section: string, field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  const addItem = (section: string, item: any) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: [...(prev[section].items || []), { ...item, id: Date.now().toString() }]
      }
    }))
  }

  const removeItem = (section: string, index: number) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.filter((_: any, i: number) => i !== index)
      }
    }))
  }

  const handleImageUpload = async (section: string, index: number, field: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        setUploading(true)
        const resourceType = file.type.startsWith('video') ? 'video' : 'image'
        const url = await uploadToCloudinary(file, resourceType)
        const newItems = [...(content as any)[section].items]
        newItems[index] = { ...newItems[index], [field]: url }
        updateField(section, 'items', newItems)
      } catch (error) {
        alert('Upload failed. Please try again.')
        console.error(error)
      } finally {
        setUploading(false)
      }
    }
  }

  const addToGallery = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        setUploading(true)
        const resourceType = file.type.startsWith('video') ? 'video' : 'image'
        const url = await uploadToCloudinary(file, resourceType)
        const newGallery = [...(content.media?.gallery || []), {
          id: Date.now().toString(),
          url: url,
          type: file.type.startsWith('video') ? 'video' : 'image',
          name: file.name,
          addedAt: new Date().toISOString()
        }]
        setContent((prev: any) => ({ ...prev, media: { gallery: newGallery } }))
      } catch (error) {
        alert('Upload failed. Please try again.')
        console.error(error)
      } finally {
        setUploading(false)
      }
    }
  }

  const removeFromGallery = (id: string) => {
    const newGallery = (content.media?.gallery || []).filter((item: any) => item.id !== id)
    setContent((prev: any) => ({ ...prev, media: { gallery: newGallery } }))
  }

  // Project Reels handlers
  const handleProjectReelUpload = async (
    projectIndex: number,
    field: 'verticalReels' | 'horizontalReels',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const newItems = [...(content as any).projects.items]
      const currentReels = [...(newItems[projectIndex][field] || [])]
      for (let f = 0; f < files.length; f++) {
        const file = files[f]
        const url = await uploadToCloudinary(file, 'video')
        currentReels.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url,
          caption: '',
          type: 'video'
        })
      }
      newItems[projectIndex] = {
        ...newItems[projectIndex],
        [field]: currentReels
      }
      updateField('projects', 'items', newItems)
    } catch (error) {
      alert('Video upload failed. Please try again.')
      console.error(error)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const addProjectReelByUrl = (
    projectIndex: number,
    field: 'verticalReels' | 'horizontalReels',
    url: string
  ) => {
    if (!url || !url.trim()) return
    const newItems = [...(content as any).projects.items]
    const currentReels = [...(newItems[projectIndex][field] || [])]
    currentReels.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url: url.trim(),
      caption: '',
      type: 'video'
    })
    newItems[projectIndex] = {
      ...newItems[projectIndex],
      [field]: currentReels
    }
    updateField('projects', 'items', newItems)
  }

  const removeProjectReel = (
    projectIndex: number,
    field: 'verticalReels' | 'horizontalReels',
    reelIndex: number
  ) => {
    const newItems = [...(content as any).projects.items]
    const currentReels = [...(newItems[projectIndex][field] || [])].filter((_, idx) => idx !== reelIndex)
    newItems[projectIndex] = {
      ...newItems[projectIndex],
      [field]: currentReels
    }
    updateField('projects', 'items', newItems)
  }

  const updateProjectReelCaption = (
    projectIndex: number,
    field: 'verticalReels' | 'horizontalReels',
    reelIndex: number,
    caption: string
  ) => {
    const newItems = [...(content as any).projects.items]
    const currentReels = [...(newItems[projectIndex][field] || [])]
    if (currentReels[reelIndex]) {
      currentReels[reelIndex] = typeof currentReels[reelIndex] === 'string'
        ? { id: Date.now().toString(), url: currentReels[reelIndex], caption, type: 'video' }
        : { ...currentReels[reelIndex], caption }
      newItems[projectIndex] = {
        ...newItems[projectIndex],
        [field]: currentReels
      }
      updateField('projects', 'items', newItems)
    }
  }

  // Content Showcase handlers

  const handleContentUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        const resourceType = file.type.startsWith('video') ? 'video' : 'image'
        const url = await uploadToCloudinary(file, resourceType)

        const newItems = [...((content.contentShowcase as any)?.[field] || []), {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url: url,
          type: file.type.startsWith('video') ? 'video' : 'image',
          caption: '',
          muted: true
        }]
        setContent((prev: any) => ({ ...prev, contentShowcase: { ...prev.contentShowcase, [field]: newItems } }))
      } catch (error) {
        alert('Upload failed. Please try again.')
        console.error(error)
      } finally {
        setUploading(false)
        event.target.value = ''
      }
    }
  }

  const removeContentItem = (field: string, index: number) => {
    try {
      const currentItems = content.contentShowcase?.[field as keyof typeof content.contentShowcase]
      if (!currentItems || !Array.isArray(currentItems)) return
      const newItems = currentItems.filter((_: any, i: number) => i !== index)
      setContent((prev: any) => ({ ...prev, contentShowcase: { ...prev.contentShowcase, [field]: newItems } }))
    } catch (e) {
      console.error('Error removing item:', e)
    }
  }

  const toggleMute = (field: string, index: number) => {
    try {
      const currentItems = (content.contentShowcase as any)?.[field]
      if (!currentItems || !Array.isArray(currentItems)) return
      const newItems = [...currentItems] as any[]
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], muted: !newItems[index].muted }
        setContent((prev: any) => ({ ...prev, contentShowcase: { ...prev.contentShowcase, [field]: newItems } }))
      }
    } catch (e) {
      console.error('Error toggling mute:', e)
    }
  }

  // Content Showcase Item Component
  const ContentShowcaseItem = ({ index, item, field, isImage }: { index: number, item: any, field: string, isImage?: boolean }) => {
    if (!item) return null
    return (
    <div className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
      {item.type === 'video' ? (
        <video src={item.url} className="w-20 h-20 object-cover rounded" />
      ) : (
        <img src={item.url} alt="content" className="w-20 h-20 object-cover rounded" />
      )}
      <div className="flex-1">
        <span className="text-sm text-gray-300">Item {index + 1}</span>
      </div>
      {!isImage && item.type === 'video' && (
        <button type="button" onClick={() => toggleMute(field, index)} className={`p-2 rounded-lg flex items-center gap-1 text-xs ${item.muted === false ? 'bg-green-600' : 'bg-red-600'}`}>
          {item.muted === false ? <><Volume2 className="w-3 h-3" /> On</> : <><VolumeX className="w-3 h-3" /> Off</>}
        </button>
      )}
      <button type="button" onClick={() => removeContentItem(field, index)} className="p-2 text-red-400 hover:text-red-300">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )}

  const sections = [
    { id: 'hero', label: 'Hero', icon: Layers },
    { id: 'about', label: 'About', icon: FileText },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Palette },
    { id: 'testimonials', label: 'Testimonials', icon: Copy },
    { id: 'workflow', label: 'Workflow', icon: RefreshCw },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'contact', label: 'Contact', icon: Link },
    { id: 'projects', label: 'Projects', icon: Image },
    { id: 'brands', label: 'Brands', icon: Building },
    { id: 'contentShowcase', label: 'Content', icon: Video },
    { id: 'reels', label: 'Reels (Old)', icon: Video },
    { id: 'media', label: 'Media Gallery', icon: Video },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Portfolio Admin</h1>
          <span className="text-xs bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-3 py-1 rounded-full font-semibold">CMS v2.2 (Multi-Reels)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPushing}
            onClick={() => handleSave(true)}
            className={`px-5 py-2.5 rounded-xl font-medium flex items-center gap-2.5 shadow-lg transition-all ${
              saved
                ? 'bg-green-600 text-white shadow-green-500/20'
                : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            title="Save changes and publish live to your website"
          >
            {isPushing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>
              {isPushing
                ? 'Publishing Live...'
                : saved
                ? (saveMessage || 'Published Live!')
                : 'Save & Publish Live'}
            </span>
          </button>
          <a href="/" target="_blank" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors">
            <Eye className="w-4 h-4" />
            View Site
          </a>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg flex items-center gap-2 transition-colors" title="Logout">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800 border-r border-gray-700 py-4 overflow-y-auto">
          <div className="px-4 mb-4">
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'content' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Layers className="w-5 h-5" />
              Content
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 mt-2 transition-colors ${
                activeTab === 'media' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Video className="w-5 h-5" />
              Media
            </button>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="px-4 text-xs text-gray-500 uppercase tracking-wider mb-2">
              {activeTab === 'content' ? 'Sections' : 'Library'}
            </p>
            {activeTab === 'content' && sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Editor */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Hero Section */}
          {activeTab === 'content' && activeSection === 'hero' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Layers className="w-6 h-6" />
                Hero Section
              </h2>
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm text-gray-400">Tagline</span>
                  <input type="text" value={content.hero.tagline} onChange={(e) => updateField('hero', 'tagline', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-400">Title Line 1</span>
                    <input type="text" value={content.hero.title.line1} onChange={(e) => updateField('hero', 'title', { ...content.hero.title, line1: e.target.value })} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-400">Title Line 2</span>
                    <input type="text" value={content.hero.title.line2} onChange={(e) => updateField('hero', 'title', { ...content.hero.title, line2: e.target.value })} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-400">Title Line 3</span>
                    <input type="text" value={content.hero.title.line3} onChange={(e) => updateField('hero', 'title', { ...content.hero.title, line3: e.target.value })} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm text-gray-400">Subtitle</span>
                  <textarea value={content.hero.subtitle} onChange={(e) => updateField('hero', 'subtitle', e.target.value)} rows={3} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-400">Primary Button</span>
                    <input type="text" value={content.hero.cta.primary} onChange={(e) => updateField('hero', 'cta', { ...content.hero.cta, primary: e.target.value })} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-400">Secondary Button</span>
                    <input type="text" value={content.hero.cta.secondary} onChange={(e) => updateField('hero', 'cta', { ...content.hero.cta, secondary: e.target.value })} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                  </label>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Stats</h3>
                  {(content.hero?.stats || []).map((stat: any, i: number) => (
                    <div key={i} className="flex gap-4 mb-2">
                      <input type="text" value={stat.value} onChange={(e) => { const newStats = [...(content.hero?.stats || [])]; newStats[i].value = e.target.value; updateField('hero', 'stats', newStats) }} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Value" />
                      <input type="text" value={stat.label} onChange={(e) => { const newStats = [...(content.hero?.stats || [])]; newStats[i].label = e.target.value; updateField('hero', 'stats', newStats) }} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Label" />
                      <button onClick={() => { const newStats = (content.hero?.stats || []).filter((_: any, idx: number) => idx !== i); updateField('hero', 'stats', newStats) }} className="p-2 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => updateField('hero', 'stats', [...(content.hero?.stats || []), { value: "0", label: "New Stat" }])} className="mt-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Stat</button>
                </div>
              </div>
            </div>
          )}

          {/* About Section */}
          {activeTab === 'content' && activeSection === 'about' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                About Section
              </h2>
              <div className="grid gap-4">
                {/* Profile Image */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Profile Image
                  </h3>
                  {content.about?.profileImage ? (
                    <div className="relative inline-block">
                      <img src={content.about.profileImage} alt="Profile" className="w-32 h-32 object-cover rounded-full border-2 border-purple-500" />
                      <button onClick={() => updateField('about', 'profileImage', '')} className="absolute -top-2 -right-2 p-2 bg-red-600 rounded-full hover:bg-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <Image className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-sm text-gray-500">Click to upload profile image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            setUploading(true)
                            const url = await uploadToCloudinary(file, 'image')
                            updateField('about', 'profileImage', url)
                          } catch (error) {
                            alert('Upload failed. Please try again.')
                          } finally {
                            setUploading(false)
                          }
                        }
                      }} />
                    </label>
                  )}
                </div>
                <label className="block">
                  <span className="text-sm text-gray-400">Tagline</span>
                  <input type="text" value={content.about?.tagline || ''} onChange={(e) => updateField('about', 'tagline', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Title</span>
                  <input type="text" value={content.about?.title || ''} onChange={(e) => updateField('about', 'title', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Description</span>
                  <textarea value={content.about?.description || ''} onChange={(e) => updateField('about', 'description', e.target.value)} rows={4} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(content.about?.skills || []).map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-700 rounded-full flex items-center gap-2">
                        {skill}
                        <button onClick={() => { const newSkills = (content.about?.skills || []).filter((_: any, idx: number) => idx !== i); updateField('about', 'skills', newSkills) }}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <input type="text" placeholder="Add new skill and press Enter" className="w-full mt-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value.trim()) { updateField('about', 'skills', [...(content.about?.skills || []), e.currentTarget.value.trim()]); e.currentTarget.value = '' } }} />
                </div>
              </div>
            </div>
          )}

          {/* Services Section */}
          {activeTab === 'content' && activeSection === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  Services Section
                </h2>
                <button onClick={() => addItem('services', { icon: "Star", title: "New Service", desc: "Service description", color: "#00C2FF" })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm text-gray-400">Tagline</span>
                  <input type="text" value={content.services.tagline} onChange={(e) => updateField('services', 'tagline', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Title</span>
                  <input type="text" value={content.services.title} onChange={(e) => updateField('services', 'title', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Description</span>
                  <textarea value={content.services.description} onChange={(e) => updateField('services', 'description', e.target.value)} rows={2} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <div className="grid gap-4 mt-6">
                  {(content.services?.items || []).map((service: any, i: number) => (
                    <div key={i} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">Service {i + 1}</span>
                        <div className="flex items-center gap-2">
                          <input type="color" value={service.color} onChange={(e) => { const newItems = [...(content.services?.items || [])]; newItems[i].color = e.target.value; updateField('services', 'items', newItems) }} className="w-8 h-8 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer" />
                          <button onClick={() => removeItem('services', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={service.title} onChange={(e) => { const newItems = [...(content.services?.items || [])]; newItems[i].title = e.target.value; updateField('services', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Title" />
                        <input type="text" value={service.desc} onChange={(e) => { const newItems = [...(content.services?.items || [])]; newItems[i].desc = e.target.value; updateField('services', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Description" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Skills Section */}
          {activeTab === 'content' && activeSection === 'skills' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Palette className="w-6 h-6" />
                  Skills Section
                </h2>
                <button onClick={() => addItem('skills', { name: "New Skill", value: 50, color: "#00C2FF" })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </div>
              <div className="grid gap-4">
                {(content.skills?.items || []).map((skill: any, i: number) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                    <input type="text" value={skill.name} onChange={(e) => { const newItems = [...(content.skills?.items || [])]; newItems[i].name = e.target.value; updateField('skills', 'items', newItems) }} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                    <input type="number" value={skill.value} onChange={(e) => { const newItems = [...(content.skills?.items || [])]; newItems[i].value = parseInt(e.target.value); updateField('skills', 'items', newItems) }} className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                    <input type="color" value={skill.color} onChange={(e) => { const newItems = [...(content.skills?.items || [])]; newItems[i].color = e.target.value; updateField('skills', 'items', newItems) }} className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer" />
                    <button onClick={() => removeItem('skills', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials Section */}
          {activeTab === 'content' && activeSection === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Copy className="w-6 h-6" />
                  Testimonials Section
                </h2>
                <button onClick={() => addItem('testimonials', { name: "New Client", role: "Role", text: "Testimonial text", gradient: "from-[#00C2FF] to-[#6D5EF3]", profileImage: "" })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Testimonial
                </button>
              </div>
              <div className="grid gap-4">
                {(content.testimonials?.items || []).map((testimonial: any, i: number) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">Testimonial {i + 1}</span>
                      <button onClick={() => removeItem('testimonials', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid gap-3">
                      {/* Profile Image Upload */}
                      <div className="flex items-center gap-4 mb-3">
                        {testimonial.profileImage ? (
                          <div className="relative">
                            <img src={testimonial.profileImage} alt="Client" className="w-16 h-16 rounded-full object-cover border-2 border-purple-500" />
                            <button onClick={() => { const newItems = [...(content.testimonials?.items || [])]; newItems[i].profileImage = ''; updateField('testimonials', 'items', newItems) }} className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                            <Image className="w-6 h-6 text-gray-500" />
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                try {
                                  setUploading(true)
                                  const url = await uploadToCloudinary(file, 'image')
                                  const newItems = [...(content.testimonials?.items || [])]
                                  newItems[i].profileImage = url
                                  updateField('testimonials', 'items', newItems)
                                } catch (error) {
                                  alert('Upload failed. Please try again.')
                                } finally {
                                  setUploading(false)
                                }
                              }
                            }} />
                          </label>
                        )}
                        <span className="text-sm text-gray-400">Client Photo</span>
                      </div>
                      <div className="flex gap-3">
                        <input type="text" value={testimonial.name} onChange={(e) => { const newItems = [...(content.testimonials?.items || [])]; newItems[i].name = e.target.value; updateField('testimonials', 'items', newItems) }} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Name" />
                        <input type="text" value={testimonial.role} onChange={(e) => { const newItems = [...(content.testimonials?.items || [])]; newItems[i].role = e.target.value; updateField('testimonials', 'items', newItems) }} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Role" />
                      </div>
                      <textarea value={testimonial.text} onChange={(e) => { const newItems = [...(content.testimonials?.items || [])]; newItems[i].text = e.target.value; updateField('testimonials', 'items', newItems) }} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Testimonial text" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflow Section */}
          {activeTab === 'content' && activeSection === 'workflow' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <RefreshCw className="w-6 h-6" />
                  Workflow Section
                </h2>
                <button onClick={() => addItem('workflow', { icon: "Star", label: "New Step", desc: "Step description" })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>
              <div className="grid gap-4">
                {(content.workflow?.steps || []).map((step: any, i: number) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                    <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <input type="text" value={step.label} onChange={(e) => { const newSteps = [...(content.workflow?.steps || [])]; newSteps[i].label = e.target.value; updateField('workflow', 'steps', newSteps) }} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Label" />
                    <input type="text" value={step.desc} onChange={(e) => { const newSteps = [...(content.workflow?.steps || [])]; newSteps[i].desc = e.target.value; updateField('workflow', 'steps', newSteps) }} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Description" />
                    <button onClick={() => removeItem('workflow', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Section */}
          {activeTab === 'content' && activeSection === 'timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Timeline Section
                </h2>
                <button onClick={() => addItem('timeline', { year: "2024", type: "job", title: "New Position", subtitle: "Company Name", description: "Description of your role" })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Timeline Item
                </button>
              </div>

              {/* Header Fields */}
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm text-gray-400">Tagline</span>
                  <input type="text" value={content.timeline?.tagline || ''} onChange={(e) => updateField('timeline', 'tagline', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Title</span>
                  <input type="text" value={content.timeline?.title || ''} onChange={(e) => updateField('timeline', 'title', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Description</span>
                  <textarea value={content.timeline?.description || ''} onChange={(e) => updateField('timeline', 'description', e.target.value)} rows={2} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
              </div>

              {/* Timeline Items */}
              <div className="grid gap-4">
                {(content.timeline?.items || []).map((item: any, i: number) => (
                  <div key={i} className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Timeline Item {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <select
                          value={item.type}
                          onChange={(e) => { const newItems = [...(content.timeline?.items || [])]; newItems[i].type = e.target.value; updateField('timeline', 'items', newItems) }}
                          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                        >
                          <option value="job">Job</option>
                          <option value="education">Education</option>
                        </select>
                        <button onClick={() => removeItem('timeline', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <div className="flex gap-3">
                        <input type="text" value={item.year} onChange={(e) => { const newItems = [...(content.timeline?.items || [])]; newItems[i].year = e.target.value; updateField('timeline', 'items', newItems) }} className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Year" />
                        <input type="text" value={item.title} onChange={(e) => { const newItems = [...(content.timeline?.items || [])]; newItems[i].title = e.target.value; updateField('timeline', 'items', newItems) }} className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Title" />
                      </div>
                      <input type="text" value={item.subtitle} onChange={(e) => { const newItems = [...(content.timeline?.items || [])]; newItems[i].subtitle = e.target.value; updateField('timeline', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Subtitle (Company/School)" />
                      <textarea value={item.description} onChange={(e) => { const newItems = [...(content.timeline?.items || [])]; newItems[i].description = e.target.value; updateField('timeline', 'items', newItems) }} rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Description" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeTab === 'content' && activeSection === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Link className="w-6 h-6" />
                Contact Section
              </h2>
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm text-gray-400">Tagline</span>
                  <input type="text" value={content.contact.tagline} onChange={(e) => updateField('contact', 'tagline', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Title</span>
                  <input type="text" value={content.contact.title} onChange={(e) => updateField('contact', 'title', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-400">Description</span>
                  <textarea value={content.contact.description} onChange={(e) => updateField('contact', 'description', e.target.value)} rows={3} className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none" />
                </label>
              </div>

              {/* Social Links */}
              <div className="bg-gray-800 p-4 rounded-lg mt-6">
                <h3 className="font-semibold mb-4">Social Links</h3>
                <div className="grid gap-4">
                  {(content.contact?.socials || []).map((social: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-gray-400">{social.label}</span>
                      <input
                        type="text"
                        value={social.url}
                        onChange={(e) => {
                          const newSocials = [...content.contact.socials]
                          newSocials[i] = { ...newSocials[i], url: e.target.value }
                          updateField('contact', 'socials', newSocials)
                        }}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                        placeholder={social.label === 'Email' ? 'mailto:email@example.com' : 'https://...'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects Section - WITH IMAGES & VIDEOS */}
          {activeTab === 'content' && activeSection === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Image className="w-6 h-6" />
                  Projects / Portfolio
                </h2>
                <button onClick={() => addItem('projects', { id: Date.now().toString(), slug: "", title: "New Project", client: "Client Name", category: "Category", description: "Project description", fullDescription: "", challenge: "", objectives: [], services: [], industry: "", timeline: "", tools: [], image: "", coverImage: "", video: "", verticalReels: [], horizontalReels: [], gallery: [], results: [], featured: true })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>
              <div className="grid gap-4">
                {(content as any).projects.items.map((project: any, i: number) => (
                  <div key={i} className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-lg">Project {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={project.featured} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].featured = e.target.checked; updateField('projects', 'items', newItems) }} className="w-4 h-4" />
                          <span className="text-sm text-gray-400">Featured</span>
                        </label>
                        <button onClick={() => removeItem('projects', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {/* Basic Info - Row 1 */}
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={project.title} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].title = e.target.value; updateField('projects', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Project Title" />
                        <input type="text" value={project.client} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].client = e.target.value; updateField('projects', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Client Name" />
                      </div>

                      {/* SEO Slug & Category - Row 2 */}
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={project.slug || ''} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].slug = e.target.value; updateField('projects', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="SEO Slug (e.g., brand-campaign)" />
                        <input type="text" value={project.category} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].category = e.target.value; updateField('projects', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Category (e.g., Social Media, Ad Campaign)" />
                      </div>

                      {/* Short Description */}
                      <textarea value={project.description} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].description = e.target.value; updateField('projects', 'items', newItems) }} rows={2} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Short Description (for project cards)" />

                      {/* Cover Image */}
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Image className="w-4 h-4" /> Cover Image (for details page)</h4>
                        {project.coverImage ? (
                          <div className="relative">
                            <img src={project.coverImage} alt="Cover" className="w-full h-48 object-cover rounded-lg" />
                            <button onClick={() => { const newItems = [...(content as any).projects.items]; newItems[i].coverImage = ''; updateField('projects', 'items', newItems) }} className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <label className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                            <Image className="w-8 h-8 text-gray-500 mb-2" />
                            <span className="text-sm text-gray-500">Click to upload cover image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('projects', i, 'coverImage', e)} />
                          </label>
                        )}
                      </div>

                      {/* PROJECT DETAILS SECTION */}
                      <div className="border-t border-gray-700 pt-4 mt-4">
                        <h4 className="text-lg font-semibold text-purple-400 mb-4">Project Details (Optional)</h4>

                        {/* Full Description */}
                        <div className="mb-4">
                          <label className="text-sm text-gray-400 block mb-2">Full Project Description</label>
                          <textarea value={project.fullDescription || ''} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].fullDescription = e.target.value; updateField('projects', 'items', newItems) }} rows={4} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Full description for project details page" />
                        </div>

                        {/* Business Challenge */}
                        <div className="mb-4">
                          <label className="text-sm text-gray-400 block mb-2">Business Challenge</label>
                          <textarea value={project.challenge || ''} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].challenge = e.target.value; updateField('projects', 'items', newItems) }} rows={3} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="What business challenge did this project address?" />
                        </div>

                        {/* Industry & Timeline - Row 1 */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-sm text-gray-400 block mb-2">Industry</label>
                            <input type="text" value={project.industry || ''} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].industry = e.target.value; updateField('projects', 'items', newItems) }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="e.g., Technology, Fashion" />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400 block mb-2">Timeline</label>
                            <input type="text" value={project.timeline || ''} onChange={(e) => { const newItems = [...(content as any).projects.items]; newItems[i].timeline = e.target.value; updateField('projects', 'items', newItems) }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="e.g., 3 months" />
                          </div>
                        </div>

                        {/* Services Provided */}
                        <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-semibold mb-3">Services Provided</h5>
                          <div className="flex flex-wrap gap-2">
                            {(project.services || []).map((service: string, si: number) => (
                              <span key={si} className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full flex items-center gap-2">
                                {service}
                                <button onClick={() => { const newItems = [...(content as any).projects.items]; newItems[i].services = newItems[i].services.filter((_: any, s: number) => s !== si); updateField('projects', 'items', newItems) }}><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                          <input type="text" placeholder="Add service and press Enter" className="w-full mt-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value) { const newItems = [...(content as any).projects.items]; newItems[i].services = [...(newItems[i].services || []), e.currentTarget.value]; updateField('projects', 'items', newItems); e.currentTarget.value = '' } }} />
                        </div>

                        {/* Objectives */}
                        <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-semibold mb-3">Goals & Objectives</h5>
                          <div className="flex flex-wrap gap-2">
                            {(project.objectives || []).map((obj: string, oi: number) => (
                              <span key={oi} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full flex items-center gap-2">
                                {obj}
                                <button onClick={() => { const newItems = [...(content as any).projects.items]; newItems[i].objectives = newItems[i].objectives.filter((_: any, o: number) => o !== oi); updateField('projects', 'items', newItems) }}><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                          <input type="text" placeholder="Add objective and press Enter" className="w-full mt-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value) { const newItems = [...(content as any).projects.items]; newItems[i].objectives = [...(newItems[i].objectives || []), e.currentTarget.value]; updateField('projects', 'items', newItems); e.currentTarget.value = '' } }} />
                        </div>

                        {/* Tools Used */}
                        <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-semibold mb-3">Tools Used</h5>
                          <div className="flex flex-wrap gap-2">
                            {(project.tools || []).map((tool: string, ti: number) => (
                              <span key={ti} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full flex items-center gap-2">
                                {tool}
                                <button onClick={() => { const newItems = [...(content as any).projects.items]; newItems[i].tools = newItems[i].tools.filter((_: any, t: number) => t !== ti); updateField('projects', 'items', newItems) }}><X className="w-3 h-3" /></button>
                              </span>
                            ))}
                          </div>
                          <input type="text" placeholder="Add tool and press Enter" className="w-full mt-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value) { const newItems = [...(content as any).projects.items]; newItems[i].tools = [...(newItems[i].tools || []), e.currentTarget.value]; updateField('projects', 'items', newItems); e.currentTarget.value = '' } }} />
                        </div>

                        {/* Project Gallery */}
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                          <h5 className="text-sm font-semibold mb-3">Project Gallery (Multiple Images)</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            {(project.gallery || []).map((img: string, gi: number) => (
                              <div key={gi} className="relative">
                                <img src={img} alt={`Gallery ${gi + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                <button onClick={() => { const newItems = [...(content as any).projects.items]; newItems[i].gallery = newItems[i].gallery.filter((_: any, g: number) => g !== gi); updateField('projects', 'items', newItems) }} className="absolute top-1 right-1 p-1 bg-red-600 rounded-full">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <label className="w-full h-20 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                            <Image className="w-6 h-6 text-gray-500 mb-1" />
                            <span className="text-xs text-gray-500">Click to add gallery images</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                              const files = e.target.files
                              if (files) {
                                try {
                                  setUploading(true)
                                  for (const file of Array.from(files)) {
                                    const url = await uploadToCloudinary(file, 'image')
                                    const newItems = [...(content as any).projects.items]
                                    newItems[i].gallery = [...(newItems[i].gallery || []), url]
                                    updateField('projects', 'items', newItems)
                                  }
                                } catch (error) {
                                  alert('Some uploads failed. Please try again.')
                                } finally {
                                  setUploading(false)
                                }
                              }
                            }} />
                          </label>
                        </div>
                      </div>

                      {/* Existing IMAGE UPLOAD (for backward compatibility) */}
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><Image className="w-4 h-4" /> Project Image (Card Preview)</h4>
                        {project.image ? (
                          <div className="relative">
                            <img src={project.image} alt="Project" className="w-full h-48 object-cover rounded-lg" />
                            <button onClick={() => { const newItems = [...(content as any).projects.items]; newItems[i].image = ''; updateField('projects', 'items', newItems) }} className="absolute top-2 right-2 p-2 bg-red-600 rounded-lg"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <label className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                            <Image className="w-8 h-8 text-gray-500 mb-2" />
                            <span className="text-sm text-gray-500">Click to upload image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('projects', i, 'image', e)} />
                          </label>
                        )}
                      </div>

                      {/* PROJECT REELS & VIDEOS SECTION */}
                      <div className="bg-gray-700/40 p-5 rounded-xl border border-gray-600/50 space-y-5">
                        <div>
                          <h4 className="text-base font-semibold text-purple-300 flex items-center gap-2">
                            <Film className="w-5 h-5 text-purple-400" /> Project Reels & Videos Showcase
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Add multiple vertical reels (at least 3–4 reels recommended) and optional horizontal videos. These will be displayed on the project page just like the main reel showcase!
                          </p>
                        </div>

                        {/* 1. Vertical Reels (9:16) */}
                        <div className="bg-gray-800/90 p-4 rounded-lg border border-purple-500/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                              <Film className="w-4 h-4 text-purple-400" /> Vertical Reels (9:16) — Recommended 3 to 4 Reels
                            </span>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-medium">
                              {(project.verticalReels || []).length} uploaded
                            </span>
                          </div>

                          {/* List of Vertical Reels */}
                          {(project.verticalReels || []).length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                              {(project.verticalReels || []).map((reel: any, rIdx: number) => {
                                const reelUrl = typeof reel === 'string' ? reel : reel.url
                                const reelCaption = typeof reel === 'string' ? '' : reel.caption
                                return (
                                  <div key={rIdx} className="relative bg-gray-900 rounded-lg p-2 border border-gray-700 flex flex-col gap-2">
                                    <div className="relative aspect-[9/16] w-full rounded overflow-hidden bg-black">
                                      <video src={reelUrl} className="w-full h-full object-cover" controls preload="metadata" />
                                      <button
                                        type="button"
                                        onClick={() => removeProjectReel(i, 'verticalReels', rIdx)}
                                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md z-10 transition-colors"
                                        title="Delete Reel"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Caption (optional)"
                                      value={reelCaption || ''}
                                      onChange={(e) => updateProjectReelCaption(i, 'verticalReels', rIdx, e.target.value)}
                                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-200 focus:border-purple-500 focus:outline-none"
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Upload or Add URL for Vertical Reels */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <label className={`flex-1 p-3 border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                              {uploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                  <span className="text-xs text-purple-300">Uploading Reel...</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 text-purple-400" />
                                  <span className="text-xs text-purple-300 font-medium">Click to Upload Vertical Reel(s)</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleProjectReelUpload(i, 'verticalReels', e)}
                                disabled={uploading}
                              />
                            </label>
                            <div className="flex gap-1 sm:w-1/2">
                              <input
                                type="text"
                                id={`vert-url-input-${i}`}
                                placeholder="Or paste video URL..."
                                className="flex-1 px-3 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addProjectReelByUrl(i, 'verticalReels', e.currentTarget.value)
                                    e.currentTarget.value = ''
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`vert-url-input-${i}`) as HTMLInputElement
                                  if (input && input.value) {
                                    addProjectReelByUrl(i, 'verticalReels', input.value)
                                    input.value = ''
                                  }
                                }}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg font-medium transition-colors"
                              >
                                Add URL
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 2. Horizontal Videos (16:9 - Optional) */}
                        <div className="bg-gray-800/90 p-4 rounded-lg border border-blue-500/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-400" /> Horizontal Videos (16:9) — Optional (1 to 2+ Videos)
                            </span>
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-medium">
                              {(project.horizontalReels || []).length} uploaded
                            </span>
                          </div>

                          {/* List of Horizontal Videos */}
                          {(project.horizontalReels || []).length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                              {(project.horizontalReels || []).map((reel: any, rIdx: number) => {
                                const reelUrl = typeof reel === 'string' ? reel : reel.url
                                const reelCaption = typeof reel === 'string' ? '' : reel.caption
                                return (
                                  <div key={rIdx} className="relative bg-gray-900 rounded-lg p-2 border border-gray-700 flex flex-col gap-2">
                                    <div className="relative aspect-video w-full rounded overflow-hidden bg-black">
                                      <video src={reelUrl} className="w-full h-full object-cover" controls preload="metadata" />
                                      <button
                                        type="button"
                                        onClick={() => removeProjectReel(i, 'horizontalReels', rIdx)}
                                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md z-10 transition-colors"
                                        title="Delete Video"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Caption (optional)"
                                      value={reelCaption || ''}
                                      onChange={(e) => updateProjectReelCaption(i, 'horizontalReels', rIdx, e.target.value)}
                                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-200 focus:border-blue-500 focus:outline-none"
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* Upload or Add URL for Horizontal Videos */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <label className={`flex-1 p-3 border-2 border-dashed border-blue-500/50 hover:border-blue-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                              {uploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                  <span className="text-xs text-blue-300">Uploading Video...</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 text-blue-400" />
                                  <span className="text-xs text-blue-300 font-medium">Click to Upload Horizontal Video(s)</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleProjectReelUpload(i, 'horizontalReels', e)}
                                disabled={uploading}
                              />
                            </label>
                            <div className="flex gap-1 sm:w-1/2">
                              <input
                                type="text"
                                id={`horiz-url-input-${i}`}
                                placeholder="Or paste video URL..."
                                className="flex-1 px-3 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    addProjectReelByUrl(i, 'horizontalReels', e.currentTarget.value)
                                    e.currentTarget.value = ''
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`horiz-url-input-${i}`) as HTMLInputElement
                                  if (input && input.value) {
                                    addProjectReelByUrl(i, 'horizontalReels', input.value)
                                    input.value = ''
                                  }
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors"
                              >
                                Add URL
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 3. Featured Single Video (Optional / Fallback) */}
                        <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700">
                          <h5 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                            <Video className="w-3.5 h-3.5 text-gray-400" /> Featured Single Video (Optional / Fallback)
                          </h5>
                          {project.video ? (
                            <div className="relative">
                              <video src={project.video} controls className="w-full h-36 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...(content as any).projects.items]
                                  newItems[i].video = ''
                                  updateField('projects', 'items', newItems)
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                title="Remove video"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full h-20 border border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors">
                              <Video className="w-5 h-5 text-gray-500 mb-1" />
                              <span className="text-xs text-gray-400">Click to upload single video (or use reels above)</span>
                              <input type="file" accept="video/*" className="hidden" onChange={(e) => handleImageUpload('projects', i, 'video', e)} />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* RESULTS */}
                      <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold mb-3">Results Achieved</h4>
                        <div className="flex flex-wrap gap-2">
                          {(project.results || []).map((result: string, ri: number) => (
                            <span key={ri} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full flex items-center gap-2">
                              {result}
                              <button onClick={() => { const newItems = [...(content as any).projects.items]; newItems[i].results = newItems[i].results.filter((_: any, r: number) => r !== ri); updateField('projects', 'items', newItems) }}><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                        <input type="text" placeholder="Add result (e.g., 300% Growth) and press Enter" className="w-full mt-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none" onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value) { const newItems = [...(content as any).projects.items]; newItems[i].results = [...(newItems[i].results || []), e.currentTarget.value]; updateField('projects', 'items', newItems); e.currentTarget.value = '' } }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brands Section - FOR FUTURE USE */}
          {activeTab === 'content' && activeSection === 'brands' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Building className="w-6 h-6" />
                  Brands / Clients
                </h2>
                <button onClick={() => addItem('brands', { id: Date.now().toString(), name: "Brand Name", logo: "", website: "" })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Brand
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">Add logos of companies you've worked with. This section is great for social proof.</p>
              <div className="grid gap-4">
                {(content.brands?.items || []).map((brand: any, i: number) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">Brand {i + 1}</span>
                      <button onClick={() => removeItem('brands', i)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" value={brand.name} onChange={(e) => { const newItems = [...(content.brands?.items || [])]; newItems[i].name = e.target.value; updateField('brands', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Brand Name" />
                      <input type="text" value={brand.website} onChange={(e) => { const newItems = [...(content.brands?.items || [])]; newItems[i].website = e.target.value; updateField('brands', 'items', newItems) }} className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" placeholder="Website URL" />
                      <div>
                        {brand.logo ? (
                          <div className="relative">
                            <img src={brand.logo} alt="Logo" className="h-10 object-contain" />
                            <button onClick={() => { const newItems = [...(content.brands?.items || [])]; newItems[i].logo = ''; updateField('brands', 'items', newItems) }} className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <label className="h-10 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                            <span className="text-xs text-gray-500">Logo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('brands', i, 'logo', e)} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Showcase Section */}
          {activeTab === 'content' && activeSection === 'contentShowcase' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Video className="w-6 h-6" />
                Content Showcase
              </h2>
              <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Important:</strong> Before uploading, go to your Cloudinary Dashboard → Settings → Upload →
                  Add upload preset named <code className="bg-blue-800 px-2 py-1 rounded">portfolio_unsigned</code>
                  with signing mode set to <strong>Unsigned</strong>
                </p>
              </div>
              <p className="text-gray-400 text-sm">Upload videos and images for the showcase. Each row displays different format.</p>

              {/* Labels Section */}
              <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h3 className="font-semibold mb-4 text-white">Section Labels</h3>
                <div className="grid gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-400">Vertical Videos Label</span>
                    <input
                      type="text"
                      value={content.contentShowcase?.labels?.verticalReels || ''}
                      onChange={(e) => setContent((prev: any) => ({ ...prev, contentShowcase: { ...prev.contentShowcase, labels: { ...prev.contentShowcase?.labels, verticalReels: e.target.value } } }))}
                      className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-400">Horizontal Videos Label</span>
                    <input
                      type="text"
                      value={content.contentShowcase?.labels?.horizontalReels || ''}
                      onChange={(e) => setContent((prev: any) => ({ ...prev, contentShowcase: { ...prev.contentShowcase, labels: { ...prev.contentShowcase?.labels, horizontalReels: e.target.value } } }))}
                      className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-400">Vertical Posts Label</span>
                    <input
                      type="text"
                      value={content.contentShowcase?.labels?.verticalPosts || ''}
                      onChange={(e) => setContent((prev: any) => ({ ...prev, contentShowcase: { ...prev.contentShowcase, labels: { ...prev.contentShowcase?.labels, verticalPosts: e.target.value } } }))}
                      className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-400">Horizontal Posts Label</span>
                    <input
                      type="text"
                      value={content.contentShowcase?.labels?.horizontalPosts || ''}
                      onChange={(e) => setContent((prev: any) => ({ ...prev, contentShowcase: { ...prev.contentShowcase, labels: { ...prev.contentShowcase?.labels, horizontalPosts: e.target.value } } }))}
                      className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </label>
                </div>
              </div>

              {/* Vertical Reels */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-purple-400">Row 1: Vertical Videos (Reels)</h3>
                <div className="grid gap-4">
                  {(content.contentShowcase?.verticalReels || []).map((item: any, i: number) => (
                    <ContentShowcaseItem key={item.id} index={i} item={item} field="verticalReels" />
                  ))}
                  <label className={`w-full p-4 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-purple-500 mb-2 animate-spin" />
                        <span className="text-sm text-gray-500">Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload vertical video</span>
                      </>
                    )}
                    <input type="file" key={`vr-${(content.contentShowcase?.verticalReels || []).length}`} accept="video/*" className="hidden" onChange={(e) => handleContentUpload(e, 'verticalReels')} disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Horizontal Reels */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-blue-400">Row 2: Horizontal Videos</h3>
                <div className="grid gap-4">
                  {(content.contentShowcase?.horizontalReels || []).map((item: any, i: number) => (
                    <ContentShowcaseItem key={item.id} index={i} item={item} field="horizontalReels" />
                  ))}
                  <label className={`w-full p-4 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-blue-500 mb-2 animate-spin" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload horizontal video</span>
                      </>
                    )}
                    <input type="file" key={`hr-${(content.contentShowcase?.horizontalReels || []).length}`} accept="video/*" className="hidden" onChange={(e) => handleContentUpload(e, 'horizontalReels')} disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Vertical Posts */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-pink-400">Row 3: Vertical Posts (Images)</h3>
                <div className="grid gap-4">
                  {(content.contentShowcase?.verticalPosts || []).map((item: any, i: number) => (
                    <ContentShowcaseItem key={item.id} index={i} item={item} field="verticalPosts" isImage />
                  ))}
                  <label className={`w-full p-4 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-pink-500 mb-2 animate-spin" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Image className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload vertical post image</span>
                      </>
                    )}
                    <input type="file" key={`vp-${(content.contentShowcase?.verticalPosts || []).length}`} accept="image/*" className="hidden" onChange={(e) => handleContentUpload(e, 'verticalPosts')} disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Horizontal Posts */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-green-400">Row 4: Horizontal Posts (Images)</h3>
                <div className="grid gap-4">
                  {(content.contentShowcase?.horizontalPosts || []).map((item: any, i: number) => (
                    <ContentShowcaseItem key={item.id} index={i} item={item} field="horizontalPosts" isImage />
                  ))}
                  <label className={`w-full p-4 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-green-500 mb-2 animate-spin" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Image className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload horizontal post image</span>
                      </>
                    )}
                    <input type="file" key={`hp-${(content.contentShowcase?.horizontalPosts || []).length}`} accept="image/*" className="hidden" onChange={(e) => handleContentUpload(e, 'horizontalPosts')} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Reels Section */}
          {activeTab === 'content' && activeSection === 'reels' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Video className="w-6 h-6" />
                  Instagram Reels
                </h2>
                <button onClick={() => addItem('reels', { id: Date.now().toString(), url: "", caption: "", views: "" })} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Reel
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-4">Add Instagram Reel links to showcase your content on the frontend.</p>

              <div className="grid gap-4">
                {(content.reels?.items || []).map((reel: any, i: number) => (
                  <div key={i} className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Reel {i + 1}</span>
                      <button onClick={() => removeItem('reels', i)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-2">Instagram Reel URL</label>
                        <input
                          type="text"
                          value={reel.url}
                          onChange={(e) => {
                            const newItems = [...(content.reels?.items || [])]
                            newItems[i].url = e.target.value
                            updateField('reels', 'items', newItems)
                          }}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                          placeholder="https://www.instagram.com/reel/XXXXXXXXX/"
                        />
                        <p className="text-xs text-gray-500 mt-1">Paste the full Instagram Reel URL</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Caption (optional)</label>
                          <input
                            type="text"
                            value={reel.caption}
                            onChange={(e) => {
                              const newItems = [...(content.reels?.items || [])]
                              newItems[i].caption = e.target.value
                              updateField('reels', 'items', newItems)
                            }}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                            placeholder="Reel caption"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Views (optional)</label>
                          <input
                            type="text"
                            value={reel.views}
                            onChange={(e) => {
                              const newItems = [...(content.reels?.items || [])]
                              newItems[i].views = e.target.value
                              updateField('reels', 'items', newItems)
                            }}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                            placeholder="e.g., 1M views"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Gallery Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Video className="w-6 h-6" />
                  Media Gallery
                </h2>
                <label className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Upload Media
                  <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={addToGallery} />
                </label>
              </div>
              <p className="text-gray-400 text-sm mb-4">Upload images and videos to use in your portfolio. Click on any media to use it in projects.</p>

              {(content.media?.gallery || []).length === 0 ? (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center">
                  <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No media uploaded yet</p>
                  <p className="text-gray-600 text-sm">Upload images and videos to use in your projects</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(content.media?.gallery || []).map((item: any) => (
                    <div key={item.id} className="relative group">
                      {item.type === 'video' ? (
                        <video src={item.url} className="w-full h-32 object-cover rounded-lg" />
                      ) : (
                        <img src={item.url} alt={item.name} className="w-full h-32 object-cover rounded-lg" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button onClick={() => removeFromGallery(item.id)} className="p-2 bg-red-600 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 text-xs bg-black/70 px-2 py-0.5 rounded">{item.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Section */}
          {activeTab === 'content' && activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Site Settings
              </h2>
              <div className="grid gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">General Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm text-gray-400">Site Name</span>
                      <input type="text" value={content.settings.siteName} onChange={(e) => updateField('settings', 'siteName', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-400">Site Title</span>
                      <input type="text" value={content.settings.siteTitle} onChange={(e) => updateField('settings', 'siteTitle', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-400">Email</span>
                      <input type="email" value={content.settings.email} onChange={(e) => updateField('settings', 'email', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-400">Phone</span>
                      <input type="text" value={content.settings.phone} onChange={(e) => updateField('settings', 'phone', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                    </label>
                    <label className="block col-span-2">
                      <span className="text-sm text-gray-400">Location</span>
                      <input type="text" value={content.settings.location} onChange={(e) => updateField('settings', 'location', e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                    </label>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Brand Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm text-gray-400">Primary Color</span>
                      <div className="flex gap-3 mt-1">
                        <input type="color" value={content.settings.primaryColor} onChange={(e) => updateField('settings', 'primaryColor', e.target.value)} className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer" />
                        <input type="text" value={content.settings.primaryColor} onChange={(e) => updateField('settings', 'primaryColor', e.target.value)} className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-sm text-gray-400">Secondary Color</span>
                      <div className="flex gap-3 mt-1">
                        <input type="color" value={content.settings.secondaryColor} onChange={(e) => updateField('settings', 'secondaryColor', e.target.value)} className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer" />
                        <input type="text" value={content.settings.secondaryColor} onChange={(e) => updateField('settings', 'secondaryColor', e.target.value)} className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}