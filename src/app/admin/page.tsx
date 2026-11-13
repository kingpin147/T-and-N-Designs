"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  FolderGit2, 
  BookOpen, 
  BarChart3, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Mail, 
  Phone, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Upload, 
  ArrowLeft,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  UserPlus,
  ShieldCheck,
  LogOut,
  KeyRound,
  Activity,
  Radio,
  CheckCheck,
  Zap,
  Copy,
  Check,
  TrendingUp,
  LayoutDashboard,
  Layers,
  FileText,
  Settings,
  Download,
  AlertCircle,
  MapPin,
  Eye,
  Menu,
  X,
  Globe,
  ArrowUpRight,
  LayoutGrid,
  List,
  Star,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import PostHogAnalyticsDashboard from "@/components/admin/PostHogAnalyticsDashboard";
import GA4OverviewDashboard from "@/components/admin/GA4OverviewDashboard";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "project_manager" | "writer";
  permissions: {
    canManageLeads: boolean;
    canManageProjects: boolean;
    canManageBlog: boolean;
    canManageUsers: boolean;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  canManageLeads: boolean;
  canManageProjects: boolean;
  canManageBlog: boolean;
  canManageUsers: boolean;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  budgetRange?: string;
  timeline?: string;
  message: string;
  location?: string;
  ipAddress?: string;
  status: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription?: string;
  fullDescription: string;
  tags: string[];
  coverImageUrl: string;
  projectUrl?: string;
  featured?: boolean;
  views?: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  readTime: number;
  tags: string[];
  published: boolean;
  publishedAt: string;
  views?: number;
}

const DEFAULT_OWNER_PROFILE: UserProfile = {
  id: "owner-root",
  name: "T & N Designs Owner",
  email: "nomiking0072012@gmail.com",
  role: "admin",
  permissions: {
    canManageLeads: true,
    canManageProjects: true,
    canManageBlog: true,
    canManageUsers: true,
  },
};

function sanitizeExcerpt(text: string): string {
  if (!text) return "";
  return text
    .replace(/^(overview|summary|description):\s*/i, "")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatCategory(cat?: string): string {
  if (!cat) return "Web Design";
  const lower = cat.toLowerCase();
  if (lower.includes("wix") || lower.includes("velo")) return "Wix Migration";
  if (lower.includes("custom") || lower.includes("enterprise")) return "Custom Build";
  if (lower.includes("web") || lower.includes("saas")) return "Web Design";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export default function AdminDashboardPage() {
  const router = useRouter();
  // Initialize with verified owner profile so tabs and data are never blank
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_OWNER_PROFILE);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "projects" | "blog" | "users" | "analytics">("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // State Data
  const [stats, setStats] = useState({
    totalLeads: 0,
    contactedLeads: 0,
    pendingLeads: 0,
    totalProjects: 0,
    totalPosts: 0,
  });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [overviewAnalytics, setOverviewAnalytics] = useState<any | null>(null);
  const [showGaSetupModal, setShowGaSetupModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("all");
  const [projectStatusFilter, setProjectStatusFilter] = useState<"all" | "featured" | "live" | "internal">("all");

  const [blogSearch, setBlogSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState<"all" | "published" | "scheduled" | "draft">("all");

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({});
  const [postPublishMode, setPostPublishMode] = useState<"immediate" | "schedule" | "draft">("immediate");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "writer",
    canManageLeads: false,
    canManageProjects: false,
    canManageBlog: true,
  });
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ tempPassword?: string; message?: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit Team Member Access Modal
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    name: "",
    email: "",
    role: "writer",
    canManageLeads: false,
    canManageProjects: false,
    canManageBlog: true,
  });
  const [savingUser, setSavingUser] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(3600); // 1-hour automatic session limit
  const [overviewRange, setOverviewRange] = useState<"7d" | "14d" | "30d">("30d");

  const handleRangeChange = async (range: "7d" | "14d" | "30d") => {
    setOverviewRange(range);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`).then((r) => r.json());
      if (res && res.success && res.data) {
        setOverviewAnalytics(res.data);
      }
    } catch (err) {
      console.error("Range change fetch error:", err);
    }
  };

  // Load Current User Session
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        setCurrentUser(data.user);
        setAuthChecked(true);
        if (data.user.role === "writer") {
          setActiveTab("blog");
        } else if (data.user.role === "project_manager") {
          setActiveTab("leads");
        }
      } else {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    }
  };

  const handleSaveUserPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editUserForm.email,
          role: editUserForm.role,
          permissions: {
            canManageLeads: editUserForm.canManageLeads,
            canManageProjects: editUserForm.canManageProjects,
            canManageBlog: editUserForm.canManageBlog,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update member access");
      }
      setEditUserModalOpen(false);
      loadDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving user access");
    } finally {
      setSavingUser(false);
    }
  };

  // Load Dashboard Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, inqRes, projRes, postsRes, usersRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/inquiries").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/projects").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/posts").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/users").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/analytics?range=30d").then((r) => r.json()).catch(() => ({})),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (inqRes.success) setInquiries(inqRes.inquiries || []);
      if (projRes.success) setProjects(projRes.projects || []);
      if (postsRes.success) setPosts(postsRes.posts || []);
      if (usersRes.success) setTeamMembers(usersRes.users || []);
      if (analyticsRes && analyticsRes.success && analyticsRes.data) {
        setOverviewAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  // 1-Hour Automatic Session Logout Interval
  useEffect(() => {
    if (!authChecked) return;

    const timer = setInterval(() => {
      setSessionSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          alert("Your 1-hour admin session has expired. You have been safely logged out.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authChecked]);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  // Update Lead Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        showToast(`Lead status updated to ${newStatus}.`, "success");
      } else {
        showToast(data.error || "Failed to update lead status.", "error");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Network error updating status.", "error");
    }
  };

  // Delete Lead from CRM
  const handleDeleteInquiry = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete lead from "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        showToast("Inquiry removed from CRM.", "success");
      } else {
        showToast(data.error || "Failed to delete inquiry.", "error");
      }
    } catch {
      showToast("Network error deleting inquiry.", "error");
    }
  };

  // Export Filtered Leads to CSV
  const exportLeadsToCSV = () => {
    if (filteredInquiries.length === 0) {
      showToast("No inquiries available to export.", "error");
      return;
    }
    const headers = ["ID", "Name", "Email", "Phone", "Company", "Location", "IP Address", "Service", "Status", "Date", "Message"];
    const rows = filteredInquiries.map((inq) => [
      `"${inq.id || ""}"`,
      `"${(inq.name || "").replace(/"/g, '""')}"`,
      `"${(inq.email || "").replace(/"/g, '""')}"`,
      `"${(inq.phone || "").replace(/"/g, '""')}"`,
      `"${(inq.company || "").replace(/"/g, '""')}"`,
      `"${(inq.location || "").replace(/"/g, '""')}"`,
      `"${(inq.ipAddress || "").replace(/"/g, '""')}"`,
      `"${(inq.projectType || "").replace(/"/g, '""')}"`,
      `"${(inq.status || "").replace(/"/g, '""')}"`,
      `"${new Date(inq.createdAt).toLocaleString()}"`,
      `"${(inq.message || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tnn-leads-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredInquiries.length} leads to CSV.`, "success");
  };

  // Image upload to Neon Object Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: "portfolio" | "blog") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        if (folder === "portfolio") {
          setCurrentProject((prev) => ({ ...prev, coverImageUrl: data.url }));
        } else {
          setCurrentPost((prev) => ({ ...prev, coverImageUrl: data.url }));
        }
        showToast("Image uploaded to Object Storage!", "success");
      } else {
        showToast(data.error || "Image upload failed.", "error");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      showToast("Network error uploading image.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentProject.id ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentProject),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjectModalOpen(false);
        showToast(currentProject.id ? "Project updated successfully!" : "New project published successfully!", "success");
        loadDashboardData();
      } else {
        showToast(data.error || "Failed to save project.", "error");
      }
    } catch (err) {
      console.error("Error saving project:", err);
      showToast("Network error saving project.", "error");
    }
  };

  // Quick Publish Immediately (for Scheduled or Draft posts)
  const handleQuickPublish = async (post: Post) => {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`"${post.title}" is now published immediately!`, "success");
        loadDashboardData();
      } else {
        showToast(data.error || "Failed to publish immediately.", "error");
      }
    } catch (err) {
      console.error("Quick publish error:", err);
      showToast("Network error publishing article.", "error");
    }
  };

  // Save Blog Post (Immediate, Scheduled, or Draft)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();

    let published = true;
    let publishedAt = new Date().toISOString();

    if (postPublishMode === "immediate") {
      published = true;
      publishedAt = new Date().toISOString();
    } else if (postPublishMode === "schedule") {
      if (!scheduledDateTime) {
        showToast("Please choose a date and time to schedule the article.", "error");
        return;
      }
      published = true;
      publishedAt = new Date(scheduledDateTime).toISOString();
    } else if (postPublishMode === "draft") {
      published = false;
      publishedAt = currentPost.publishedAt || new Date().toISOString();
    }

    const payload = {
      ...currentPost,
      published,
      publishedAt,
    };

    const method = currentPost.id ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/posts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPostModalOpen(false);
        const toastMsg =
          postPublishMode === "schedule"
            ? `Article scheduled for ${new Date(publishedAt).toLocaleString()}`
            : postPublishMode === "draft"
            ? "Article saved as draft."
            : currentPost.id
            ? "Article updated and live!"
            : "Article published immediately!";
        showToast(toastMsg, "success");
        loadDashboardData();
      } else {
        showToast(data.error || "Failed to save article.", "error");
      }
    } catch (err) {
      console.error("Error saving post:", err);
      showToast("Network error saving article.", "error");
    }
  };

  // Submit User Invitation
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteResult(null);

    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteForm.name,
          email: inviteForm.email,
          role: inviteForm.role,
          permissions: {
            canManageLeads: inviteForm.canManageLeads,
            canManageProjects: inviteForm.canManageProjects,
            canManageBlog: inviteForm.canManageBlog,
            canManageUsers: inviteForm.role === "admin",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to invite user");
      }

      setInviteResult({
        tempPassword: data.tempPassword,
        message: data.message,
      });

      loadDashboardData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error sending invitation");
    } finally {
      setInviting(false);
    }
  };

  // Role permissions check
  const isAdmin = currentUser.role === "admin";
  const canAccessLeads = isAdmin || currentUser.permissions?.canManageLeads;
  const canAccessProjects = isAdmin || currentUser.permissions?.canManageProjects;
  const canAccessBlog = isAdmin || currentUser.permissions?.canManageBlog;
  const canAccessUsers = isAdmin;

  // Filtered Leads
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = leadStatusFilter === "all" || inq.status === leadStatusFilter;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus;
    const matchesSearch =
      inq.name.toLowerCase().includes(term) ||
      inq.email.toLowerCase().includes(term) ||
      inq.projectType.toLowerCase().includes(term) ||
      (inq.company && inq.company.toLowerCase().includes(term)) ||
      (inq.message && inq.message.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  // Filtered Projects
  const filteredProjects = projects.filter((proj) => {
    const matchesCategory =
      projectCategoryFilter === "all" ||
      proj.category?.toLowerCase() === projectCategoryFilter.toLowerCase() ||
      (projectCategoryFilter === "custom" && proj.category?.toLowerCase().includes("custom")) ||
      (projectCategoryFilter === "wix-migration" && (proj.category?.toLowerCase().includes("wix") || proj.category?.toLowerCase().includes("velo"))) ||
      (projectCategoryFilter === "web-development" && (proj.category?.toLowerCase().includes("web") || proj.category?.toLowerCase().includes("saas")));

    const matchesStatus =
      projectStatusFilter === "all" ||
      (projectStatusFilter === "featured" && proj.featured) ||
      (projectStatusFilter === "live" && Boolean(proj.projectUrl)) ||
      (projectStatusFilter === "internal" && !proj.projectUrl);

    if (!matchesCategory || !matchesStatus) return false;

    const term = projectSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      proj.title.toLowerCase().includes(term) ||
      (proj.slug && proj.slug.toLowerCase().includes(term)) ||
      (proj.shortDescription && proj.shortDescription.toLowerCase().includes(term)) ||
      (proj.fullDescription && proj.fullDescription.toLowerCase().includes(term)) ||
      (proj.tags && proj.tags.some((t) => t.toLowerCase().includes(term)))
    );
  });

  // Filtered Blog Posts
  const filteredPosts = posts.filter((post) => {
    const isScheduled = Boolean(post.published && post.publishedAt && new Date(post.publishedAt).getTime() > Date.now());
    const isDraft = !post.published;
    const isPublished = Boolean(post.published && (!post.publishedAt || new Date(post.publishedAt).getTime() <= Date.now()));

    const matchesStatus =
      blogStatusFilter === "all" ||
      (blogStatusFilter === "published" && isPublished) ||
      (blogStatusFilter === "scheduled" && isScheduled) ||
      (blogStatusFilter === "draft" && isDraft);

    if (!matchesStatus) return false;

    const term = blogSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      post.title.toLowerCase().includes(term) ||
      (post.slug && post.slug.toLowerCase().includes(term)) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(term)) ||
      (post.content && post.content.toLowerCase().includes(term)) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(term)))
    );
  });

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: "16px" }}>
        <Loader2 className="animate-spin" size={36} color="#123968" />
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#123968" }}>
          Verifying Admin Credentials...
        </div>
        <p style={{ fontSize: "13px", color: "#64748b" }}>Admin Control Panel</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0f172a", position: "relative" }}>
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 1. ADMIN SIDEBAR NAVIGATION MENU */}
      <aside
        className={`admin-sidebar ${mobileSidebarOpen ? "open" : ""}`}
        style={{
          width: "280px",
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          height: "100vh",
          padding: "24px 18px",
          flexShrink: 0,
          boxShadow: "2px 0 12px rgba(18, 57, 104, 0.03)",
          zIndex: 160,
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Image
                src="/logo.svg"
                alt="T & N Designs"
                width={34}
                height={34}
                priority
                style={{ objectFit: "contain", borderRadius: "6px" }}
              />
              <div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#123968", letterSpacing: "-0.3px" }}>
                  T &amp; N Designs
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ● Admin Control Panel
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="admin-sidebar-close-btn"
              style={{
                background: "#f1f5f9",
                border: "none",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
              title="Close Menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Menu Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={() => { setActiveTab("overview"); setMobileSidebarOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "overview" ? "#123968" : "transparent",
                color: activeTab === "overview" ? "#ffffff" : "#475569",
                fontSize: "14px",
                fontWeight: activeTab === "overview" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <BarChart3 size={18} />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("leads"); setMobileSidebarOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "leads" ? "#123968" : "transparent",
                color: activeTab === "leads" ? "#ffffff" : "#475569",
                fontSize: "14px",
                fontWeight: activeTab === "leads" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Users size={18} />
                <span>Lead Pipeline</span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: activeTab === "leads" ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                  color: activeTab === "leads" ? "#ffffff" : "#123968",
                  fontWeight: 700,
                }}
              >
                {inquiries.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("projects"); setMobileSidebarOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "projects" ? "#123968" : "transparent",
                color: activeTab === "projects" ? "#ffffff" : "#475569",
                fontSize: "14px",
                fontWeight: activeTab === "projects" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FolderGit2 size={18} />
                <span>Projects &amp; Media</span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: activeTab === "projects" ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                  color: activeTab === "projects" ? "#ffffff" : "#123968",
                  fontWeight: 700,
                }}
              >
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("blog"); setMobileSidebarOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "blog" ? "#123968" : "transparent",
                color: activeTab === "blog" ? "#ffffff" : "#475569",
                fontSize: "14px",
                fontWeight: activeTab === "blog" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <BookOpen size={18} />
                <span>Blog Articles</span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: activeTab === "blog" ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                  color: activeTab === "blog" ? "#ffffff" : "#123968",
                  fontWeight: 700,
                }}
              >
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("users"); setMobileSidebarOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "users" ? "#123968" : "transparent",
                color: activeTab === "users" ? "#ffffff" : "#475569",
                fontSize: "14px",
                fontWeight: activeTab === "users" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <ShieldCheck size={18} />
                <span>Team &amp; Access</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveTab("analytics"); setMobileSidebarOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "analytics" ? "#123968" : "transparent",
                color: activeTab === "analytics" ? "#ffffff" : "#475569",
                fontSize: "14px",
                fontWeight: activeTab === "analytics" ? 700 : 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Activity size={18} />
                <span>Analytics &amp; GEO</span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "999px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontWeight: 700,
                }}
              >
                LIVE
              </span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", marginTop: "auto" }}>
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#64748b",
              fontWeight: 600,
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: "8px",
              transition: "all 0.15s ease",
            }}
            className="hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={15} /> Back to Public Website
          </a>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Mobile Sticky Top Header (< 1024px) */}
        <div className="admin-mobile-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#123968",
                cursor: "pointer",
              }}
              aria-label="Open Admin Menu"
            >
              <Menu size={20} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Image src="/logo.svg" alt="T & N Designs" width={26} height={26} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#123968" }}>
                Admin Panel
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: sessionSecondsLeft < 300 ? "#ef4444" : "#0284c7", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>
              {formatSessionTime(sessionSecondsLeft)}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
              title="Log Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>

        {/* 2. MAIN CONTENT AREA */}
        <main className="admin-main-content" style={{ flex: 1, padding: "28px 36px", overflowY: "auto", minHeight: "100vh" }}>
        {/* Global Admin Header Bar with Session Status & Prominent Log Out */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            marginBottom: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#123968" }}>
              Verified: <strong style={{ color: "#0284c7" }}>{currentUser.email}</strong>
            </span>
            <span style={{ fontSize: "10px", fontWeight: 800, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
              {currentUser.role}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: sessionSecondsLeft < 300 ? "#ef4444" : "#64748b",
                background: "#f8fafc",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
              title="Session automatically logs out after 1 hour"
            >
              <Clock size={13} color={sessionSecondsLeft < 300 ? "#ef4444" : "#64748b"} />
              <span>Session: <strong style={{ color: sessionSecondsLeft < 300 ? "#ef4444" : "#0f172a" }}>{formatSessionTime(sessionSecondsLeft)}</strong> left</span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 16px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#dc2626",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title="Click to sign out of admin panel"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Header + Unified Date Filter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>
                  Executive Overview
                </h1>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                  Real-time agency performance from Neon PostgreSQL and Google Analytics 4.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {/* Unified [ 7D | 14D | 30D ] Segmented Date Filter */}
                <div
                  style={{
                    display: "inline-flex",
                    background: "#f1f5f9",
                    padding: "3px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {(["7d", "14d", "30d"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRangeChange(r)}
                      style={{
                        padding: "5px 12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        background: overviewRange === r ? "#ffffff" : "transparent",
                        color: overviewRange === r ? "#0f172a" : "#64748b",
                        boxShadow: overviewRange === r ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                      }}
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab("analytics")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#123968",
                    color: "#ffffff",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <TrendingUp size={15} /> Deep Analytics &amp; GEO
                </button>
              </div>
            </div>

            {/* UNIFIED COMPACT BENTO HUD (8 KPIs, 220px Timeline, 2-Col Telemetry) */}
            <GA4OverviewDashboard
              data={overviewAnalytics?.ga4 || null}
              loading={loading}
              timeRange={overviewRange}
              crmStats={{
                totalLeads: stats.totalLeads,
                contactedLeads: stats.contactedLeads,
                pendingLeads: stats.pendingLeads,
                totalProjects: projects.length || stats.totalProjects,
              }}
              onNavigateTab={(tab, filter) => {
                if (filter) setLeadStatusFilter(filter);
                setActiveTab(tab as any);
              }}
            />
          </div>
        )}

        {/* TAB 2: LEADS PIPELINE CRM */}
        {activeTab === "leads" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                  Lead Pipeline &amp; CRM
                </h1>
                <p style={{ color: "#475569", fontSize: "15px" }}>
                  Track client inquiries submitted through the website contact forms.
                </p>
              </div>

              {/* Status Filters & Search */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "6px", background: "#ffffff", padding: "4px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  {["all", "new", "contacted", "not contacted", "closed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setLeadStatusFilter(st)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: leadStatusFilter === st ? "#123968" : "transparent",
                        color: leadStatusFilter === st ? "#ffffff" : "#475569",
                        textTransform: "capitalize",
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 12px", width: "240px" }}>
                  <Search size={16} color="#94a3b8" style={{ marginRight: "8px" }} />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: "none", border: "none", outline: "none", color: "#0f172a", fontSize: "13px", width: "100%" }}
                  />
                </div>

                <button
                  onClick={exportLeadsToCSV}
                  className="btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  title="Export filtered inquiries to CSV spreadsheet"
                >
                  <Download size={15} /> Export CSV
                </button>
              </div>
            </div>

            {filteredInquiries.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "48px", textAlign: "center", color: "#64748b" }}>
                No inquiries matching the selected criteria.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {filteredInquiries.map((inq) => (
                  <div key={inq.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{inq.name}</h3>
                          {inq.company && (
                            <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", color: "#475569", fontWeight: 600 }}>
                              {inq.company}
                            </span>
                          )}
                          {inq.location && (
                            <span
                              style={{
                                fontSize: "12px",
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                                padding: "3px 10px",
                                borderRadius: "999px",
                                fontWeight: 600,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                              title={inq.ipAddress ? `Client IP: ${inq.ipAddress}` : undefined}
                            >
                              <MapPin size={12} color="#2563eb" /> {inq.location}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#64748b", marginTop: "4px", flexWrap: "wrap" }}>
                          <span>Received on {new Date(inq.createdAt).toLocaleString()}</span>
                          {inq.ipAddress && (
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                              • IP: {inq.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Selector Dropdown */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Status:</span>
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateStatus(inq.id, e.target.value)}
                          style={{
                            background: inq.status === "contacted" ? "#dcfce7" : inq.status === "not contacted" ? "#fee2e2" : "#fef3c7",
                            color: inq.status === "contacted" ? "#166534" : inq.status === "not contacted" ? "#991b1b" : "#92400e",
                            border: "1px solid #cbd5e1",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "13px",
                            fontWeight: 700,
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="not contacted">Not Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                      <span style={{ fontSize: "13px", background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "6px", fontWeight: 600 }}>
                        Service: {inq.projectType || "General Web Inquiry"}
                      </span>
                      {inq.budgetRange && (
                        <span style={{ fontSize: "13px", background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "6px", fontWeight: 600 }}>
                          Budget: {inq.budgetRange}
                        </span>
                      )}
                      {inq.timeline && (
                        <span style={{ fontSize: "13px", background: "#f1f5f9", color: "#334155", padding: "4px 10px", borderRadius: "6px", fontWeight: 600 }}>
                          Timeline: {inq.timeline}
                        </span>
                      )}
                    </div>

                    <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px", fontSize: "14px", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {inq.message}
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                      <a href={`mailto:${inq.email}?subject=Regarding%20your%20project%20inquiry%20with%20T%20%26%20N%20Designs`} className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px", maxWidth: "100%", overflowWrap: "anywhere" }}>
                        <Mail size={14} style={{ flexShrink: 0 }} /> <span>Send Email ({inq.email})</span>
                      </a>
                      {inq.phone && (
                        <a href={`tel:${inq.phone}`} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px", maxWidth: "100%", overflowWrap: "anywhere" }}>
                          <Phone size={14} style={{ flexShrink: 0 }} /> <span>Call ({inq.phone})</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteInquiry(inq.id, inq.name)}
                        className="btn-secondary"
                        style={{ padding: "8px 12px", fontSize: "13px", color: "#b91c1c", marginLeft: "auto" }}
                        title="Delete inquiry from database"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROJECTS MANAGER */}
        {activeTab === "projects" && (
          <div>
            {/* Header & Controls Strip */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Portfolio Projects &amp; Media</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    {filteredProjects.length}{filteredProjects.length !== projects.length ? ` of ${projects.length}` : ""}
                  </span>
                </h1>
                <p style={{ color: "#64748b", fontSize: "13px" }}>
                  Verified client builds stored in Neon PostgreSQL and S3 cloud storage.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 10px", width: "200px" }}>
                  <Search size={14} color="#94a3b8" style={{ marginRight: "8px", flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    style={{ background: "none", border: "none", outline: "none", color: "#0f172a", fontSize: "13px", width: "100%" }}
                  />
                </div>

                {/* Category filter */}
                <select
                  value={projectCategoryFilter}
                  onChange={(e) => setProjectCategoryFilter(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#0f172a",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="custom">Custom Enterprise</option>
                  <option value="web-development">Web Development</option>
                  <option value="wix-migration">Wix Migration &amp; Velo</option>
                </select>

                {/* Add New Project */}
                <button
                  onClick={() => {
                    setCurrentProject({ title: "", category: "web-development", fullDescription: "", tags: [], coverImageUrl: "/portfolio/energt-gurus-online.png", featured: false });
                    setProjectModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: "7px 14px", fontSize: "13px" }}
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>
            </div>

            {/* Segmented Status Filter Tabs */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: "All", count: projects.length },
                { id: "featured", label: "Featured", count: projects.filter(p => p.featured).length },
                { id: "live", label: "Live Public", count: projects.filter(p => Boolean(p.projectUrl)).length },
                { id: "internal", label: "Internal Portals", count: projects.filter(p => !p.projectUrl).length },
              ].map((tab) => {
                const isActive = projectStatusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProjectStatusFilter(tab.id as any)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      background: isActive ? "#eff6ff" : "#ffffff",
                      color: isActive ? "#1d4ed8" : "#475569",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{ fontSize: "11px", opacity: 0.8, padding: "1px 6px", borderRadius: "10px", background: isActive ? "#dbeafe" : "#f1f5f9" }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredProjects.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#64748b" }}>
                No projects found matching the current search or filters.
              </div>
            ) : (
              /* Guaranteed 4-Column Responsive Grid */
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                  gap: "16px",
                }}
              >
                {filteredProjects.map((proj) => {
                  const projectImg = proj.coverImageUrl || "/portfolio/energt-gurus-online.png";

                  return (
                    <div
                      key={proj.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Fixed-height h-40 Cover <img> Thumbnail */}
                      <div
                        className="h-40 w-full bg-slate-100 relative overflow-hidden"
                        style={{ height: "160px", width: "100%", background: "#f1f5f9", position: "relative", overflow: "hidden" }}
                      >
                        {projectImg ? (
                          <img
                            src={projectImg}
                            alt={proj.title}
                            className="w-full h-full object-cover object-top"
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const placeholder = target.parentElement?.querySelector(".img-placeholder") as HTMLElement;
                              if (placeholder) placeholder.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="img-placeholder"
                          style={{
                            display: projectImg ? "none" : "flex",
                            width: "100%",
                            height: "100%",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f1f5f9",
                            padding: "16px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ffffff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                            <Layers size={18} color="#2563eb" />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>T &amp; N Project</span>
                        </div>

                        {/* Overlay Badges */}
                        <div
                          className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10"
                          style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", gap: "6px", zIndex: 10 }}
                        >
                          {proj.featured && (
                            <span
                              className="bg-white/90 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md shadow-sm border border-slate-200/60 inline-flex items-center gap-1"
                              style={{ background: "rgba(255, 255, 255, 0.92)", color: "#b45309", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(226, 232, 240, 0.8)", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                              <Star size={11} color="#d97706" fill="#d97706" />
                              <span>Featured</span>
                            </span>
                          )}
                          <span
                            className="bg-white/90 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md shadow-sm border border-slate-200/60"
                            style={{ background: "rgba(255, 255, 255, 0.92)", color: "#334155", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(226, 232, 240, 0.8)" }}
                          >
                            {formatCategory(proj.category)}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div
                        className="p-4 flex-1 flex flex-col justify-between"
                        style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                      >
                        <div>
                          <h3
                            title={proj.title}
                            className="text-sm font-semibold text-slate-900 line-clamp-2"
                            style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "6px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {proj.title}
                          </h3>

                          <p
                            className="line-clamp-2 text-xs text-slate-500 mt-1"
                            style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {sanitizeExcerpt(proj.fullDescription || proj.shortDescription || "")}
                          </p>

                          <div
                            style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, marginTop: "8px" }}
                          >
                            <span>{proj.projectUrl ? "Live Public" : "Internal Portal"}</span>
                            <span style={{ margin: "0 6px" }}>•</span>
                            <span>{proj.views || 0} views</span>
                          </div>
                        </div>

                        {/* Aligned Bottom Action Row */}
                        <div
                          className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between"
                          style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        >
                          <div style={{ minWidth: 0 }}>
                            {proj.projectUrl ? (
                              <a
                                href={proj.projectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px", textDecoration: "none" }}
                              >
                                <span>Visit Live</span>
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                                Internal Portal
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentProject(proj);
                                setProjectModalOpen(true);
                              }}
                              className="btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 600 }}
                            >
                              <Edit3 size={11} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Delete project "${proj.title}"?`)) {
                                  await fetch(`/api/admin/projects?id=${proj.id}`, { method: "DELETE" });
                                  loadDashboardData();
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: "4px 7px", fontSize: "11px", color: "#b91c1c" }}
                              title="Delete project"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BLOG ARTICLES */}
        {activeTab === "blog" && (
          <div>
            {/* Header & Controls Strip */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Blog Articles &amp; Insights</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    {filteredPosts.length}{filteredPosts.length !== posts.length ? ` of ${posts.length}` : ""}
                  </span>
                </h1>
                <p style={{ color: "#64748b", fontSize: "13px" }}>
                  Articles published on the public site and indexed by Google &amp; AI engines.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 10px", width: "220px" }}>
                  <Search size={14} color="#94a3b8" style={{ marginRight: "8px", flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    style={{ background: "none", border: "none", outline: "none", color: "#0f172a", fontSize: "13px", width: "100%" }}
                  />
                </div>

                {/* Write New Article */}
                <button
                  onClick={() => {
                    setCurrentPost({ title: "", content: "", excerpt: "", readTime: 5, tags: ["AI", "Web Design"], published: true });
                    setPostPublishMode("immediate");
                    setScheduledDateTime("");
                    setPostModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: "7px 14px", fontSize: "13px" }}
                >
                  <Plus size={14} /> Write Article
                </button>
              </div>
            </div>

            {/* Segmented Status Filter Tabs */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: "All", count: posts.length },
                {
                  id: "published",
                  label: "Published",
                  count: posts.filter((p) => p.published && (!p.publishedAt || new Date(p.publishedAt).getTime() <= Date.now())).length,
                },
                {
                  id: "scheduled",
                  label: "Scheduled",
                  count: posts.filter((p) => p.published && p.publishedAt && new Date(p.publishedAt).getTime() > Date.now()).length,
                },
                { id: "draft", label: "Drafts", count: posts.filter((p) => !p.published).length },
              ].map((tab) => {
                const isActive = blogStatusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBlogStatusFilter(tab.id as any)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      background: isActive ? "#eff6ff" : "#ffffff",
                      color: isActive ? "#1d4ed8" : "#475569",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{ fontSize: "11px", opacity: 0.8, padding: "1px 6px", borderRadius: "10px", background: isActive ? "#dbeafe" : "#f1f5f9" }}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredPosts.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#64748b" }}>
                No blog articles found matching the current search or filters.
              </div>
            ) : (
              /* Guaranteed 4-Column Responsive Grid */
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
                  gap: "16px",
                }}
              >
                {filteredPosts.map((post) => {
                  const isScheduled = Boolean(post.published && post.publishedAt && new Date(post.publishedAt).getTime() > Date.now());
                  const isDraft = !post.published;
                  const blogImg = post.coverImageUrl;

                  return (
                    <div
                      key={post.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col"
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Fixed-height h-40 Cover <img> Thumbnail */}
                      <div
                        className="h-40 w-full bg-slate-100 relative overflow-hidden"
                        style={{ height: "160px", width: "100%", background: "#f1f5f9", position: "relative", overflow: "hidden" }}
                      >
                        {blogImg ? (
                          <img
                            src={blogImg}
                            alt={post.title}
                            className="w-full h-full object-cover object-top"
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = "none";
                              const placeholder = target.parentElement?.querySelector(".img-placeholder") as HTMLElement;
                              if (placeholder) placeholder.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="img-placeholder"
                          style={{
                            display: blogImg ? "none" : "flex",
                            width: "100%",
                            height: "100%",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f1f5f9",
                            padding: "16px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ffffff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
                            <FileText size={18} color="#059669" />
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>Article Insight</span>
                        </div>

                        {/* Clean Frosted Status Pill */}
                        <div
                          className="absolute top-2.5 right-2.5 flex items-center z-10"
                          style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", zIndex: 10 }}
                        >
                          {isDraft ? (
                            <span
                              className="bg-white/90 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md shadow-sm border border-slate-200/60 inline-flex items-center gap-1.5"
                              style={{ background: "rgba(255, 255, 255, 0.92)", color: "#475569", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(226, 232, 240, 0.8)", display: "inline-flex", alignItems: "center", gap: "5px" }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#94a3b8" }} />
                              <span>Draft</span>
                            </span>
                          ) : isScheduled ? (
                            <span
                              className="bg-white/90 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md shadow-sm border border-slate-200/60 inline-flex items-center gap-1.5"
                              style={{ background: "rgba(255, 255, 255, 0.92)", color: "#1d4ed8", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(191, 219, 254, 0.8)", display: "inline-flex", alignItems: "center", gap: "5px" }}
                              title={`Scheduled for ${new Date(post.publishedAt).toLocaleString()}`}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb" }} />
                              <span>{new Date(post.publishedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                            </span>
                          ) : (
                            <span
                              className="bg-white/90 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md shadow-sm border border-slate-200/60 inline-flex items-center gap-1.5"
                              style={{ background: "rgba(255, 255, 255, 0.92)", color: "#065f46", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(167, 243, 208, 0.8)", display: "inline-flex", alignItems: "center", gap: "5px" }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#059669" }} />
                              <span>Published</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div
                        className="p-4 flex-1 flex flex-col justify-between"
                        style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                      >
                        <div>
                          <h3
                            title={post.title}
                            className="text-sm font-semibold text-slate-900 line-clamp-2"
                            style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "6px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {post.title}
                          </h3>

                          <p
                            className="line-clamp-2 text-xs text-slate-500 mt-1"
                            style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {sanitizeExcerpt(post.excerpt || post.content || "")}
                          </p>

                          <div
                            style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, marginTop: "8px" }}
                          >
                            <span>{post.readTime} min read</span>
                            <span style={{ margin: "0 6px" }}>•</span>
                            <span>{post.views || 0} views</span>
                          </div>
                        </div>

                        {/* Compact Aligned Footer */}
                        <div
                          className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between"
                          style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        >
                          <div style={{ minWidth: 0 }}>
                            {(isDraft || isScheduled) ? (
                              <button
                                type="button"
                                onClick={() => handleQuickPublish(post)}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "#059669",
                                  background: "#ecfdf5",
                                  border: "1px solid #a7f3d0",
                                  borderRadius: "5px",
                                  padding: "3px 8px",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                                title="Publish immediately to public site"
                              >
                                <Zap size={11} /> Publish
                              </button>
                            ) : (
                              <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "2px 6px", borderRadius: "4px" }}>
                                Live
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "6px" }}>
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="btn-secondary"
                              style={{ padding: "4px 7px", fontSize: "11px" }}
                              title="Preview article"
                            >
                              <ExternalLink size={11} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentPost(post);
                                if (!post.published) {
                                  setPostPublishMode("draft");
                                  setScheduledDateTime("");
                                } else if (post.publishedAt && new Date(post.publishedAt).getTime() > Date.now()) {
                                  setPostPublishMode("schedule");
                                  const dt = new Date(post.publishedAt);
                                  const offset = dt.getTimezoneOffset() * 60000;
                                  const localISOTime = new Date(dt.getTime() - offset).toISOString().slice(0, 16);
                                  setScheduledDateTime(localISOTime);
                                } else {
                                  setPostPublishMode("immediate");
                                  setScheduledDateTime("");
                                }
                                setPostModalOpen(true);
                              }}
                              className="btn-secondary"
                              style={{ padding: "4px 7px", fontSize: "11px" }}
                              title="Edit article"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Delete post "${post.title}"?`)) {
                                  await fetch(`/api/admin/posts?id=${post.id}`, { method: "DELETE" });
                                  loadDashboardData();
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: "4px 7px", fontSize: "11px", color: "#b91c1c" }}
                              title="Delete article"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TEAM & PERMISSIONS */}
        {activeTab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                  Team &amp; Access Control
                </h1>
                <p style={{ color: "#475569", fontSize: "15px" }}>
                  Invite team members and assign granular permissions for leads, portfolio, and blog.
                </p>
              </div>

              <button
                onClick={() => {
                  setInviteResult(null);
                  setInviteForm({ name: "", email: "", role: "writer", canManageLeads: false, canManageProjects: false, canManageBlog: true });
                  setInviteModalOpen(true);
                }}
                className="btn-primary"
                style={{ padding: "10px 20px", fontSize: "14px" }}
              >
                <UserPlus size={16} /> Invite Team Member
              </button>
            </div>

            {/* Team Members Table */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", overflowX: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>
                    <th style={{ padding: "12px" }}>Member Name</th>
                    <th style={{ padding: "12px" }}>Email</th>
                    <th style={{ padding: "12px" }}>Role</th>
                    <th style={{ padding: "12px" }}>Assigned Modules</th>
                    <th style={{ padding: "12px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => {
                    const isOwner = member.role === "admin" || (currentUser?.email && member.email.toLowerCase() === currentUser.email.toLowerCase());
                    return (
                      <tr key={member.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 12px", fontWeight: 700, color: "#0f172a" }}>
                          {member.name || "Team Member"}
                          {isOwner && (
                            <span style={{ marginLeft: "8px", fontSize: "10px", background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: "4px", fontWeight: 800 }}>
                              OWNER
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 12px", color: "#475569" }}>{member.email}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderRadius: "999px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background: member.role === "admin" ? "#e0f2fe" : "#f1f5f9",
                              color: member.role === "admin" ? "#0369a1" : "#475569",
                            }}
                          >
                            {member.role.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {member.canManageLeads && (
                              <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#334155" }}>Leads</span>
                            )}
                            {member.canManageProjects && (
                              <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#334155" }}>Projects</span>
                            )}
                            {member.canManageBlog && (
                              <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#334155" }}>Blog</span>
                            )}
                            {member.canManageUsers && (
                              <span style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#334155" }}>Users</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {!isOwner ? (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => {
                                  setEditUserForm({
                                    name: member.name,
                                    email: member.email,
                                    role: member.role,
                                    canManageLeads: member.canManageLeads,
                                    canManageProjects: member.canManageProjects,
                                    canManageBlog: member.canManageBlog,
                                  });
                                  setEditUserModalOpen(true);
                                }}
                                className="btn-secondary"
                                style={{ padding: "6px 10px", fontSize: "12px", color: "#123968" }}
                                title="Edit Permissions & Role"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Remove access for ${member.email}?`)) {
                                    await fetch(`/api/admin/users?email=${encodeURIComponent(member.email)}`, { method: "DELETE" });
                                    loadDashboardData();
                                  }
                                }}
                                className="btn-secondary"
                                style={{ padding: "6px 10px", fontSize: "12px", color: "#b91c1c" }}
                                title="Revoke Access"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Protected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ANALYTICS & GEO */}
        {activeTab === "analytics" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                Traffic Analytics &amp; Generative Engine Optimization
              </h1>
              <p style={{ color: "#475569", fontSize: "15px" }}>
                Verified telemetry from PostHog reverse proxy, GA4, and LLM web crawlers.
              </p>
            </div>
            <PostHogAnalyticsDashboard />
          </div>
        )}
        </main>
      </div>

      {/* 2026 RESPONSIVE MODAL: PROJECT EDIT / CREATE */}
      {projectModalOpen && (
        <div className="modern-modal-overlay" onClick={() => setProjectModalOpen(false)}>
          <div className="modern-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-drag-handle" />
            <div className="modern-modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {currentProject.id ? "Edit Project" : "Create New Project"}
              </h3>
              <button
                type="button"
                onClick={() => setProjectModalOpen(false)}
                className="modern-modal-close-btn"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>
              <div className="modern-modal-body">
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Title *</label>
                  <input
                    type="text"
                    required
                    value={currentProject.title || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Category</label>
                  <select
                    value={currentProject.category || "web-development"}
                    onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  >
                    <option value="custom">Custom Enterprise</option>
                    <option value="web-development">Web Development</option>
                    <option value="wix-migration">Wix Migration &amp; Velo</option>
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <RichTextEditor
                    label="Description"
                    required
                    value={currentProject.fullDescription || ""}
                    onChange={(val) => setCurrentProject({ ...currentProject, fullDescription: val })}
                    placeholder="Write structured case study overview, key highlights, tech stack..."
                    rows={8}
                    type="project"
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Live Project URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={currentProject.projectUrl || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, projectUrl: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Wix Studio, Velo JavaScript, Next.js, API Integration"
                    value={(currentProject.tags || []).join(", ")}
                    onChange={(e) =>
                      setCurrentProject({
                        ...currentProject,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  />
                </div>

                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    id="projectFeatured"
                    checked={!!currentProject.featured}
                    onChange={(e) => setCurrentProject({ ...currentProject, featured: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#123968" }}
                  />
                  <label htmlFor="projectFeatured" style={{ fontSize: "13px", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                    Feature on Homepage Portfolio Showcase
                  </label>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Upload Cover to Neon Object Storage</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "portfolio")}
                    style={{ fontSize: "13px", color: "#475569" }}
                  />
                  {uploadingImage && <span style={{ fontSize: "12px", color: "#123968", marginLeft: "8px", fontWeight: 600 }}>Uploading to S3...</span>}
                </div>
              </div>

              <div className="modern-modal-footer">
                <button type="button" onClick={() => setProjectModalOpen(false)} className="btn-secondary" style={{ padding: "8px 16px" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "8px 20px" }}>Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2026 RESPONSIVE MODAL: BLOG EDIT / CREATE */}
      {postModalOpen && (
        <div className="modern-modal-overlay" onClick={() => setPostModalOpen(false)}>
          <div className="modern-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-drag-handle" />
            <div className="modern-modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {currentPost.id ? "Edit Blog Article" : "Write New Blog Article"}
              </h3>
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                className="modern-modal-close-btn"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePost} style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>
              <div className="modern-modal-body">
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Title *</label>
                  <input
                    type="text"
                    required
                    value={currentPost.title || ""}
                    onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Excerpt</label>
                  <input
                    type="text"
                    value={currentPost.excerpt || ""}
                    onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <RichTextEditor
                    label="Article Content"
                    required
                    value={currentPost.content || ""}
                    onChange={(val) => setCurrentPost({ ...currentPost, content: val })}
                    placeholder="Write article content, headings, key takeaways, code..."
                    rows={10}
                    type="blog"
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="AI Trends, Web Development, Wix Studio, Next.js"
                    value={(currentPost.tags || []).join(", ")}
                    onChange={(e) =>
                      setCurrentPost({
                        ...currentPost,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Estimated Read Time (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={currentPost.readTime || 5}
                    onChange={(e) => setCurrentPost({ ...currentPost, readTime: parseInt(e.target.value) || 5 })}
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  />
                </div>

                {/* Publishing Schedule Control */}
                <div style={{ marginBottom: "20px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
                    Publishing Schedule
                  </label>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setPostPublishMode("immediate")}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: postPublishMode === "immediate" ? "2px solid #059669" : "1px solid #cbd5e1",
                        background: postPublishMode === "immediate" ? "rgba(5, 150, 105, 0.08)" : "#ffffff",
                        color: postPublishMode === "immediate" ? "#047857" : "#475569",
                        fontWeight: postPublishMode === "immediate" ? 700 : 500,
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <Zap size={15} /> Publish Now
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPostPublishMode("schedule");
                        if (!scheduledDateTime) {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(9, 0, 0, 0);
                          const offset = tomorrow.getTimezoneOffset() * 60000;
                          const localISOTime = new Date(tomorrow.getTime() - offset).toISOString().slice(0, 16);
                          setScheduledDateTime(localISOTime);
                        }
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: postPublishMode === "schedule" ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                        background: postPublishMode === "schedule" ? "rgba(79, 70, 229, 0.08)" : "#ffffff",
                        color: postPublishMode === "schedule" ? "#4338ca" : "#475569",
                        fontWeight: postPublishMode === "schedule" ? 700 : 500,
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <Clock size={15} /> Schedule
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostPublishMode("draft")}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: postPublishMode === "draft" ? "2px solid #64748b" : "1px solid #cbd5e1",
                        background: postPublishMode === "draft" ? "rgba(100, 116, 139, 0.08)" : "#ffffff",
                        color: postPublishMode === "draft" ? "#334155" : "#475569",
                        fontWeight: postPublishMode === "draft" ? 700 : 500,
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <FileText size={15} /> Save Draft
                    </button>
                  </div>

                  {postPublishMode === "schedule" && (
                    <div style={{ background: "#ffffff", border: "1px solid #c7d2fe", borderRadius: "8px", padding: "12px", marginTop: "8px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#3730a3", marginBottom: "6px" }}>
                        Select Go-Live Date &amp; Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          color: "#0f172a",
                          background: "#f8fafc",
                        }}
                      />
                      <div style={{ fontSize: "11px", color: "#6366f1", marginTop: "6px" }}>
                        ℹ️ This post will be automatically made live and visible to visitors on this date and time.
                      </div>
                    </div>
                  )}

                  {postPublishMode === "immediate" && (
                    <div style={{ fontSize: "12px", color: "#059669", fontWeight: 500, marginTop: "4px" }}>
                      ✓ Will be published live immediately upon clicking save.
                    </div>
                  )}

                  {postPublishMode === "draft" && (
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, marginTop: "4px" }}>
                      🔒 Kept in draft mode. Only visible to admins in this dashboard.
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Upload Article Cover</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "blog")}
                    style={{ fontSize: "13px", color: "#475569" }}
                  />
                  {uploadingImage && <span style={{ fontSize: "12px", color: "#123968", marginLeft: "8px", fontWeight: 600 }}>Uploading to S3...</span>}
                </div>
              </div>

              <div className="modern-modal-footer">
                <button type="button" onClick={() => setPostModalOpen(false)} className="btn-secondary" style={{ padding: "8px 16px" }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: "8px 20px" }}>
                  {postPublishMode === "immediate" ? "Publish Immediately ⚡" : postPublishMode === "schedule" ? "Schedule Article 📅" : "Save as Draft 📝"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2026 RESPONSIVE MODAL: INVITE TEAM MEMBER */}
      {inviteModalOpen && (
        <div className="modern-modal-overlay" onClick={() => setInviteModalOpen(false)}>
          <div className="modern-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-drag-handle" />
            <div className="modern-modal-header">
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Invite Team Member</h3>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Assign role and module access</div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="modern-modal-close-btn"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modern-modal-body">
              {inviteResult ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <CheckCircle2 size={48} color="#059669" style={{ margin: "0 auto 16px auto" }} />
                  <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Invitation Sent!</h4>
                  <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                    {inviteResult.message}
                  </p>
                  <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", marginBottom: "24px" }}>
                    Temporary Password: <strong>{inviteResult.tempPassword}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="btn-primary"
                    style={{ padding: "10px 24px" }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInviteUser} id="invite-form">
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      placeholder="e.g. Alex Rivera"
                      style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Work Email *</label>
                    <input
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      placeholder="alex@company.com"
                      style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Role Assignment</label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => {
                        const r = e.target.value;
                        setInviteForm({
                          ...inviteForm,
                          role: r,
                          canManageLeads: r === "admin" || r === "project_manager",
                          canManageProjects: r === "admin" || r === "project_manager",
                          canManageBlog: true,
                        });
                      }}
                      style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                    >
                      <option value="project_manager">Project Manager (Leads &amp; Projects)</option>
                      <option value="writer">Writer / Content Editor (Blog)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>
                </form>
              )}
            </div>

            {!inviteResult && (
              <div className="modern-modal-footer">
                <button type="button" onClick={() => setInviteModalOpen(false)} className="btn-secondary" style={{ padding: "8px 16px" }}>Cancel</button>
                <button type="submit" form="invite-form" disabled={inviting} className="btn-primary" style={{ padding: "8px 20px" }}>
                  {inviting ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2026 RESPONSIVE MODAL: EDIT TEAM MEMBER */}
      {editUserModalOpen && (
        <div className="modern-modal-overlay" onClick={() => setEditUserModalOpen(false)}>
          <div className="modern-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-drag-handle" />
            <div className="modern-modal-header">
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Edit Permissions</h3>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{editUserForm.email}</div>
              </div>
              <button
                type="button"
                onClick={() => setEditUserModalOpen(false)}
                className="modern-modal-close-btn"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUserPermissions} id="edit-user-form">
              <div className="modern-modal-body">
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Member Name</label>
                  <input
                    type="text"
                    disabled
                    value={editUserForm.name}
                    style={{ width: "100%", padding: "10px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#64748b", cursor: "not-allowed" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Role Assignment</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => {
                      const r = e.target.value;
                      setEditUserForm({
                        ...editUserForm,
                        role: r,
                        canManageLeads: r === "admin" || r === "project_manager",
                        canManageProjects: r === "admin" || r === "project_manager",
                        canManageBlog: true,
                      });
                    }}
                    style={{ width: "100%", padding: "10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#0f172a" }}
                  >
                    <option value="project_manager">Project Manager (Leads &amp; Projects)</option>
                    <option value="writer">Writer / Content Editor (Blog Only)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="modern-modal-footer">
                <button type="button" onClick={() => setEditUserModalOpen(false)} className="btn-secondary" style={{ padding: "8px 16px" }}>Cancel</button>
                <button type="submit" disabled={savingUser} className="btn-primary" style={{ padding: "8px 20px" }}>
                  {savingUser ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STEP-BY-STEP GOOGLE ANALYTICS 4 DATA API SETUP */}
      {showGaSetupModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowGaSetupModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Connect Google Analytics 4 (Data API)
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Follow these 4 simple steps to pull maximum live GA4 reporting data into your dashboard.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGaSetupModal(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Step 1 */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", flexShrink: 0 }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Find your GA4 Property ID
                </div>
                <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                  Go to <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 600 }}>Google Analytics</a> &gt; Click the <strong>Admin gear (⚙️)</strong> in the bottom-left &gt; Click <strong>Property Details</strong>. Copy your 9-digit <strong>Property ID</strong> (e.g. <code>458291823</code>).
                </p>
                <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
                  Note: Your current measurement ID is <strong>G-N4VF65ME9Q</strong>. The Property ID is a separate number found right in Property Details!
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", flexShrink: 0 }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Create a Google Cloud Service Account
                </div>
                <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                  Go to the <a href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 600 }}>Google Cloud Console</a> &gt; Enable the <strong>Google Analytics Data API</strong> &gt; Go to <strong>IAM &amp; Admin &gt; Service Accounts</strong> &gt; Click <strong>Create Service Account</strong> &gt; Generate and download a <strong>JSON Key</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", flexShrink: 0 }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Grant &ldquo;Viewer&rdquo; Permission in Google Analytics
                </div>
                <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                  In Google Analytics &gt; <strong>Admin ⚙️ &gt; Property Access Management</strong> &gt; Click <strong>(+) Add users</strong> &gt; Paste your service account email (e.g. <code>my-sa@project-id.iam.gserviceaccount.com</code>) &gt; Set role to <strong>Viewer</strong>.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", flexShrink: 0 }}>
                4
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Add to Environment Variables
                </div>
                <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                  Add these keys to your <code>.env.local</code> and Vercel Environment Variables:
                </p>
                <div style={{ background: "#0f172a", color: "#e2e8f0", padding: "12px 14px", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace", lineHeight: 1.6 }}>
                  GA4_PROPERTY_ID=&quot;your-property-id&quot;<br />
                  GOOGLE_SERVICE_ACCOUNT_EMAIL=&quot;your-service-account@project.iam.gserviceaccount.com&quot;<br />
                  GOOGLE_PRIVATE_KEY=&quot;-----BEGIN PRIVATE KEY-----\n...&quot;
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#2563eb",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Go to Google Analytics Console <ExternalLink size={13} />
              </a>

              <button
                onClick={() => setShowGaSetupModal(false)}
                style={{
                  background: "#123968",
                  color: "#ffffff",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: toast.type === "success" ? "#065f46" : "#991b1b",
            color: "#ffffff",
            padding: "12px 22px",
            borderRadius: "10px",
            boxShadow: "0 12px 28px rgba(18, 57, 104, 0.22)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 600,
            zIndex: 9999,
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} color="#6ee7b7" /> : <AlertCircle size={18} color="#fca5a5" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
