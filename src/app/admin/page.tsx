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
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import PostHogAnalyticsDashboard from "@/components/admin/PostHogAnalyticsDashboard";
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

export default function AdminDashboardPage() {
  const router = useRouter();
  // Initialize with verified owner profile so tabs and data are never blank
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_OWNER_PROFILE);
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "projects" | "blog" | "users" | "analytics">("overview");
  const [testEventStatus, setTestEventStatus] = useState<{ fired: boolean; time: string; event: string } | null>(null);
  const [proxyTestStatus, setProxyTestStatus] = useState<{ testing: boolean; success: boolean; latency?: number; message?: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTestTelemetry = () => {
    trackEvent("admin_dashboard_ping", {
      dispatchedBy: currentUser?.email || "admin",
      timestamp: new Date().toISOString(),
      source: "T & N Designs Admin Console",
      status: "verified",
    });
    setTestEventStatus({
      fired: true,
      time: new Date().toLocaleTimeString(),
      event: "admin_dashboard_ping",
    });
  };

  const handleTestProxyEndpoint = async () => {
    setProxyTestStatus({ testing: true, success: false });
    const startTime = performance.now();
    try {
      const res = await fetch("/ingest/static/array.js", { method: "HEAD" });
      const latency = Math.round(performance.now() - startTime);
      if (res.ok) {
        setProxyTestStatus({
          testing: false,
          success: true,
          latency,
          message: `200 OK (${latency}ms) — Ingestion proxy active`,
        });
      } else {
        setProxyTestStatus({
          testing: false,
          success: false,
          latency,
          message: `Response status: ${res.status}`,
        });
      }
    } catch (e: unknown) {
      setProxyTestStatus({
        testing: false,
        success: false,
        message: e instanceof Error ? e.message : "Failed to reach /ingest proxy endpoint",
      });
    }
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
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("all");
  const [blogSearch, setBlogSearch] = useState("");

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
      const [statsRes, inqRes, projRes, postsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/inquiries").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/projects").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/posts").then((r) => r.json()).catch(() => ({})),
        fetch("/api/admin/users").then((r) => r.json()).catch(() => ({})),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (inqRes.success) setInquiries(inqRes.inquiries || []);
      if (projRes.success) setProjects(projRes.projects || []);
      if (postsRes.success) setPosts(postsRes.posts || []);
      if (usersRes.success) setTeamMembers(usersRes.users || []);
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

  // Save Blog Post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentPost.id ? "PUT" : "POST";
    try {
      const res = await fetch("/api/admin/posts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPost),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPostModalOpen(false);
        showToast(currentPost.id ? "Article updated successfully!" : "Article published successfully!", "success");
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
    const term = projectSearch.toLowerCase().trim();
    if (!term) return matchesCategory;
    const matchesSearch =
      proj.title.toLowerCase().includes(term) ||
      (proj.slug && proj.slug.toLowerCase().includes(term)) ||
      (proj.shortDescription && proj.shortDescription.toLowerCase().includes(term)) ||
      (proj.fullDescription && proj.fullDescription.toLowerCase().includes(term)) ||
      (proj.tags && proj.tags.some((t) => t.toLowerCase().includes(term)));
    return matchesCategory && matchesSearch;
  });

  // Filtered Blog Posts
  const filteredPosts = posts.filter((post) => {
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
        <p style={{ fontSize: "13px", color: "#64748b" }}>Encrypted Neon RBAC Protected Portal</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", color: "#0f172a" }}>
      {/* 1. ADMIN SIDEBAR NAVIGATION MENU */}
      <aside
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
          zIndex: 40,
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
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

          {/* Navigation Menu Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <button
              onClick={() => setActiveTab("overview")}
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
              onClick={() => setActiveTab("leads")}
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
              onClick={() => setActiveTab("projects")}
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
              onClick={() => setActiveTab("blog")}
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
              onClick={() => setActiveTab("users")}
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
              onClick={() => setActiveTab("analytics")}
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

        {/* Sidebar Footer User Card */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Active Session
              </span>
              <span style={{ fontSize: "10px", fontWeight: 700, color: sessionSecondsLeft < 300 ? "#ef4444" : "#0284c7", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                <Clock size={10} /> {formatSessionTime(sessionSecondsLeft)}
              </span>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#123968", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentUser.email}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
              <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 800, background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
                {currentUser.role}
              </span>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                1h Auto-Logout
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <button
              onClick={loadDashboardData}
              className="btn-secondary"
              style={{ flex: 1, padding: "8px 10px", fontSize: "12px", justifyContent: "center" }}
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#dc2626",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              title="Sign out of Admin Dashboard"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>

          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#123968",
              fontWeight: 600,
              textDecoration: "none",
              padding: "6px 0",
            }}
          >
            <ArrowLeft size={14} /> Back to Public Website
          </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto", minHeight: "100vh" }}>
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
          <div>
            <div style={{ marginBottom: "32px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                Executive Overview
              </h1>
              <p style={{ color: "#475569", fontSize: "15px" }}>
                Real-time metrics from Neon PostgreSQL, storage buckets, and Google Tag Manager.
              </p>
            </div>

            {/* KPI Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "36px" }}>
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                  Total Inquiries (Neon DB)
                </div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "#123968" }}>{stats.totalLeads}</div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px", fontWeight: 600 }}>Stored permanently in Postgres</div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                  Contacted Leads
                </div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "#059669" }}>{stats.contactedLeads}</div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "4px", fontWeight: 600 }}>Active team follow-up</div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                  Pending Leads
                </div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "#d97706" }}>{stats.pendingLeads}</div>
                <div style={{ fontSize: "12px", color: "#d97706", marginTop: "4px", fontWeight: 600 }}>Awaiting client outreach</div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                  Portfolio Projects
                </div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "#123968" }}>{projects.length || stats.totalProjects}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Neon Object Storage synced</div>
              </div>
            </div>

            {/* Live Telemetry Card */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px", marginBottom: "36px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    SEO, Analytics &amp; MCP Telemetry
                  </h3>
                  <p style={{ fontSize: "14px", color: "#64748b" }}>
                    Status for Google Analytics 4, GTM, PostHog, and AI Agent MCP protocol.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleSendTestTelemetry}
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: "13px" }}
                  >
                    <Zap size={14} color="#d97706" /> Test Telemetry Ping
                  </button>
                  <button
                    onClick={handleTestProxyEndpoint}
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: "13px" }}
                  >
                    <Activity size={14} color="#059669" /> Test Proxy Latency
                  </button>
                </div>
              </div>

              {testEventStatus && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  ✓ Dispatched telemetry event: <strong>{testEventStatus.event}</strong> at {testEventStatus.time}
                </div>
              )}

              {proxyTestStatus && (
                <div style={{ background: proxyTestStatus.success ? "#f0fdf4" : "#fef2f2", border: `1px solid ${proxyTestStatus.success ? "#bbf7d0" : "#fecaca"}`, color: proxyTestStatus.success ? "#166534" : "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  {proxyTestStatus.message}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#d97706", marginBottom: "6px" }}>GA4 Stream</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>G-N4VF65ME9Q</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Google Analytics 4 Live</div>
                </div>

                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#4338ca", marginBottom: "6px" }}>GTM Containers</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>GT-T5MDR2V6 · GT-MBND7LX9</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Containers Loaded in DOM</div>
                </div>

                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#059669", marginBottom: "6px" }}>AI Agent Access</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>/llms.txt · /api/mcp</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>GEO Enabled for LLM crawlers</div>
                </div>
              </div>
            </div>
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
                      <a href={`mailto:${inq.email}?subject=Regarding%20your%20project%20inquiry%20with%20T%20%26%20N%20Designs`} className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                        <Mail size={14} /> Send Email ({inq.email})
                      </a>
                      {inq.phone && (
                        <a href={`tel:${inq.phone}`} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                          <Phone size={14} /> Call ({inq.phone})
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                  Portfolio Projects &amp; Media ({filteredProjects.length}{filteredProjects.length !== projects.length ? ` of ${projects.length}` : ""})
                </h1>
                <p style={{ color: "#475569", fontSize: "15px" }}>
                  Showing verified client builds stored in Neon PostgreSQL and S3 cloud storage.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 12px", width: "220px" }}>
                  <Search size={16} color="#94a3b8" style={{ marginRight: "8px" }} />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    style={{ background: "none", border: "none", outline: "none", color: "#0f172a", fontSize: "13px", width: "100%" }}
                  />
                </div>

                <select
                  value={projectCategoryFilter}
                  onChange={(e) => setProjectCategoryFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
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

                <button
                  onClick={() => {
                    setCurrentProject({ title: "", category: "web-development", fullDescription: "", tags: [], coverImageUrl: "/portfolio/energt-gurus-online.png", featured: false });
                    setProjectModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: "10px 18px", fontSize: "14px" }}
                >
                  <Plus size={16} /> Add New Project
                </button>
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "48px", textAlign: "center", color: "#64748b" }}>
                No projects found matching the current search or category filter.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {filteredProjects.map((proj) => (
                  <div key={proj.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                    {/* Media Image Container */}
                    <div style={{ position: "relative", width: "100%", height: "200px", background: "#f1f5f9", overflow: "hidden" }}>
                      <Image
                        src={proj.coverImageUrl || "/portfolio/energt-gurus-online.png"}
                        alt={proj.title}
                        fill
                        unoptimized
                        sizes="340px"
                        style={{ objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "6px" }}>
                        {proj.featured && (
                          <span style={{ fontSize: "11px", fontWeight: 700, background: "#d97706", color: "#ffffff", padding: "3px 8px", borderRadius: "6px", backdropFilter: "blur(4px)" }}>
                            ★ Featured
                          </span>
                        )}
                        <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(18, 57, 104, 0.85)", color: "#ffffff", padding: "3px 8px", borderRadius: "6px", backdropFilter: "blur(4px)" }}>
                          {proj.category}
                        </span>
                      </div>
                    </div>

                  {/* Body */}
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "8px", lineHeight: 1.3 }}>
                      {proj.title}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, marginBottom: "16px", flexGrow: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {proj.fullDescription}
                    </p>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {proj.projectUrl ? (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "13px", color: "#123968", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          Visit Live <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Client Internal Portal</span>
                      )}

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setCurrentProject(proj);
                            setProjectModalOpen(true);
                          }}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete project "${proj.title}"?`)) {
                              await fetch(`/api/admin/projects?id=${proj.id}`, { method: "DELETE" });
                              loadDashboardData();
                            }
                          }}
                          className="btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px", color: "#b91c1c" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {/* TAB 4: BLOG ARTICLES */}
        {activeTab === "blog" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
                  Blog Articles &amp; Insights ({filteredPosts.length}{filteredPosts.length !== posts.length ? ` of ${posts.length}` : ""})
                </h1>
                <p style={{ color: "#475569", fontSize: "15px" }}>
                  Articles published on the public site and indexed by Google &amp; AI engines.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 12px", width: "240px" }}>
                  <Search size={16} color="#94a3b8" style={{ marginRight: "8px" }} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    style={{ background: "none", border: "none", outline: "none", color: "#0f172a", fontSize: "13px", width: "100%" }}
                  />
                </div>

                <button
                  onClick={() => {
                    setCurrentPost({ title: "", content: "", excerpt: "", readTime: 5, tags: ["AI", "Web Design"], published: true });
                    setPostModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ padding: "10px 18px", fontSize: "14px" }}
                >
                  <Plus size={16} /> Write New Article
                </button>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "48px", textAlign: "center", color: "#64748b" }}>
                No blog articles found matching the current search.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                {filteredPosts.map((post) => (
                  <div key={post.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                    {post.coverImageUrl && (
                      <div style={{ position: "relative", width: "100%", height: "180px", background: "#f1f5f9" }}>
                        <Image src={post.coverImageUrl} alt={post.title} fill unoptimized sizes="340px" style={{ objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              background: post.published ? "rgba(5, 150, 105, 0.9)" : "rgba(220, 38, 38, 0.9)",
                              color: "#ffffff",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            {post.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    )}
                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>{post.title}</h3>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, marginBottom: "16px", flexGrow: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.excerpt || post.content.slice(0, 120)}
                      </p>
                      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          {post.readTime} min read
                        </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link href={`/blog/${post.slug}`} target="_blank" className="btn-secondary" style={{ padding: "6px 10px", fontSize: "12px" }}>
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          onClick={() => {
                            setCurrentPost(post);
                            setPostModalOpen(true);
                          }}
                          className="btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px" }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete post "${post.title}"?`)) {
                              await fetch(`/api/admin/posts?id=${post.id}`, { method: "DELETE" });
                              loadDashboardData();
                            }
                          }}
                          className="btn-secondary"
                          style={{ padding: "6px 10px", fontSize: "12px", color: "#b91c1c" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

                <div style={{ marginBottom: "16px", display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
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

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "22px" }}>
                    <input
                      type="checkbox"
                      id="postPublished"
                      checked={currentPost.published ?? true}
                      onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#123968" }}
                    />
                    <label htmlFor="postPublished" style={{ fontSize: "13px", fontWeight: 600, color: "#334155", cursor: "pointer" }}>
                      Published
                    </label>
                  </div>
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
                <button type="submit" className="btn-primary" style={{ padding: "8px 20px" }}>Publish Article</button>
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
