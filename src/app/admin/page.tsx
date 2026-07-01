"use client";

import { useState } from "react";

interface Artwork {
  id: string;
  title: string;
  imageUrl: string;
  width: number;
  height: number;
  type: "original" | "print";
  size?: string;
  medium?: string;
  price?: number;
  description?: string;
  status: "available" | "sold" | "reserved" | "unlisted";
  featured?: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const bg = "#1a1a2e";
const card = "#16213e";
const accent = "#7FDBDA";
const text = "#e0e0e0";
const textDim = "#a0a0a0";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [editing, setEditing] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [migrated, setMigrated] = useState(false);

  async function login() {
    setLoading(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      setAuthed(true);
      loadArtworks();
    } else {
      setMessage("Wrong password");
    }
    setLoading(false);
  }

  async function loadArtworks() {
    const res = await fetch("/api/admin/artworks");
    if (res.ok) {
      const data = await res.json();
      setArtworks(data);
    }
  }

  async function saveArtwork(artwork: Artwork) {
    setLoading(true);
    const res = await fetch("/api/admin/artworks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", artwork }),
    });
    if (res.ok) {
      setMessage("Saved!");
      setEditing(null);
      loadArtworks();
    } else {
      setMessage("Save failed");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 2000);
  }

  async function deleteArtwork(id: string) {
    if (!confirm("Delete this artwork?")) return;
    setLoading(true);
    const res = await fetch("/api/admin/artworks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) {
      setMessage("Deleted");
      loadArtworks();
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 2000);
  }

  async function addArtwork(formData: Record<string, unknown>) {
    setLoading(true);
    const res = await fetch("/api/admin/artworks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", ...formData }),
    });
    if (res.ok) {
      setMessage("Added!");
      setShowAdd(false);
      loadArtworks();
    } else {
      setMessage("Add failed");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 2000);
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
    setMessage("Upload failed");
    return null;
  }

  async function runMigration() {
    setLoading(true);
    const res = await fetch("/api/admin/migrate", { method: "POST" });
    if (res.ok) {
      setMigrated(true);
      setMessage("Migration complete!");
      loadArtworks();
    } else {
      setMessage("Migration failed");
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  }

  const inputStyle: React.CSSProperties = {
    background: bg,
    color: text,
    border: `1px solid ${accent}33`,
    borderRadius: 6,
    padding: "8px 12px",
    width: "100%",
    fontSize: 14,
  };

  const btnPrimary: React.CSSProperties = {
    padding: "8px 20px",
    borderRadius: 6,
    border: "none",
    background: accent,
    color: bg,
    fontWeight: 600,
    cursor: "pointer",
  };

  const btnOutline: React.CSSProperties = {
    padding: "8px 20px",
    borderRadius: 6,
    border: `1px solid ${accent}`,
    background: "transparent",
    color: accent,
    cursor: "pointer",
    fontWeight: 500,
    textDecoration: "none",
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <div style={{ background: card, borderRadius: 12, padding: 40, width: 360 }}>
          <h1 style={{ color: accent, fontSize: 24, marginBottom: 8 }}>Admin Panel</h1>
          <p style={{ color: textDim, marginBottom: 24, fontSize: 14 }}>Authentication required</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{ ...inputStyle, padding: "12px 16px", fontSize: 16, marginBottom: 16 }}
          />
          <button onClick={login} disabled={loading} style={{ ...btnPrimary, width: "100%", padding: "12px 16px", fontSize: 16 }}>
            {loading ? "..." : "Log In"}
          </button>
          {message && <p style={{ color: "#ff6b6b", marginTop: 12, textAlign: "center" }}>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Nav Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ color: accent, fontSize: 28 }}>Artwork Manager</h1>
            <p style={{ color: textDim, fontSize: 14, marginTop: 4 }}>{artworks.length} artworks</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="/admin/shipping" style={btnOutline}>Shipping</a>
            <button onClick={() => setShowAdd(!showAdd)} style={btnPrimary}>
              {showAdd ? "Cancel" : "+ Add Artwork"}
            </button>
            {!migrated && (
              <button onClick={runMigration} disabled={loading} style={{ ...btnOutline, borderColor: textDim, color: textDim, fontSize: 12 }}>
                Migrate
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div style={{ background: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: accent }}>
            {message}
          </div>
        )}

        {/* Add Form */}
        {showAdd && (
          <AddArtworkForm
            inputStyle={inputStyle}
            onAdd={addArtwork}
            onUpload={uploadImage}
            uploading={uploading}
            loading={loading}
            onCancel={() => setShowAdd(false)}
          />
        )}

        {/* Artwork List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {artworks.map((art) => (
            <div key={art.id} style={{ background: card, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {art.imageUrl && (
                  <img src={art.imageUrl} alt={art.title} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ color: text, fontSize: 16, margin: 0 }}>{art.title}</h3>
                    <span style={{ color: textDim, fontSize: 12 }}>({art.type})</span>
                    {art.featured && <span style={{ color: accent, fontSize: 11 }}>â Featured</span>}
                  </div>
                  <p style={{ color: textDim, fontSize: 12, margin: 0 }}>
                    {art.size && `${art.size} | `}{art.medium && `${art.medium} | `}
                    {art.price ? `$${(art.price / 100).toFixed(2)}` : "No price"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: art.status === "available" ? "#2ecc7122" : art.status === "sold" ? "#e74c3c22" : "#f39c1222",
                    color: art.status === "available" ? "#2ecc71" : art.status === "sold" ? "#e74c3c" : "#f39c12",
                  }}>
                    {art.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setEditing(editing?.id === art.id ? null : art)}
                    style={{ padding: "6px 16px", borderRadius: 6, border: `1px solid ${accent}44`, background: "transparent", color: accent, cursor: "pointer", fontSize: 12 }}
                  >
                    {editing?.id === art.id ? "Close" : "Edit"}
                  </button>
                  <button
                    onClick={() => deleteArtwork(art.id)}
                    style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid #e74c3c44", background: "transparent", color: "#e74c3c", cursor: "pointer", fontSize: 12 }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              {editing?.id === art.id && (
                <EditArtworkForm
                  artwork={art}
                  inputStyle={inputStyle}
                  onSave={saveArtwork}
                  onUpload={uploadImage}
                  uploading={uploading}
                  loading={loading}
                  onCancel={() => setEditing(null)}
                />
              )}
            </div>
          ))}
        </div>

        {artworks.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: textDim }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>No artworks yet</p>
            <p style={{ fontSize: 14 }}>Click &quot;+ Add Artwork&quot; or run a migration to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddArtworkForm({
  inputStyle,
  onAdd,
  onUpload,
  uploading,
  loading,
  onCancel,
}: {
  inputStyle: React.CSSProperties;
  onAdd: (data: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string | null>;
  uploading: boolean;
  loading: boolean;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"original" | "print">("original");
  const [size, setSize] = useState("");
  const [medium, setMedium] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<"available" | "sold" | "reserved" | "unlisted">("available");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUpload(file);
    if (url) setImageUrl(url);
  }

  return (
    <div style={{ background: card, borderRadius: 12, padding: 24, marginBottom: 16 }}>
      <h2 style={{ color: accent, fontSize: 18, marginBottom: 16 }}>Add New Artwork</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as "original" | "print")} style={inputStyle}>
            <option value="original">Original</option>
            <option value="print">Print</option>
          </select>
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Size</label>
          <input value={size} onChange={(e) => setSize(e.target.value)} placeholder='e.g. 24" x 36"' style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Medium</label>
          <input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="e.g. Acrylic on canvas" style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Price (USD)</label>
          <input type="number" step="0.01" value={price || ""} onChange={(e) => setPrice(parseFloat(e.target.value || "0"))} style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "available" | "sold" | "reserved" | "unlisted")} style={inputStyle}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Image</label>
        <input type="file" accept="image/*" onChange={handleFile} style={{ color: textDim, fontSize: 13 }} />
        {uploading && <span style={{ color: accent, fontSize: 12, marginLeft: 8 }}>Uploading...</span>}
        {imageUrl && <p style={{ color: "#2ecc71", fontSize: 11, marginTop: 4 }}>Uploaded: {imageUrl.slice(-30)}</p>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={() => onAdd({ title, type, size, medium, price: Math.round(price * 100), description, imageUrl, status })}
          disabled={loading || !title}
          style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: accent, color: bg, fontWeight: 600, cursor: "pointer", opacity: loading || !title ? 0.5 : 1 }}
        >
          {loading ? "Adding..." : "Add Artwork"}
        </button>
        <button onClick={onCancel} style={{ padding: "8px 20px", borderRadius: 6, border: `1px solid ${textDim}`, background: "transparent", color: textDim, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function EditArtworkForm({
  artwork,
  inputStyle,
  onSave,
  onUpload,
  uploading,
  loading,
  onCancel,
}: {
  artwork: Artwork;
  inputStyle: React.CSSProperties;
  onSave: (artwork: Artwork) => void;
  onUpload: (file: File) => Promise<string | null>;
  uploading: boolean;
  loading: boolean;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(artwork.title);
  const [type, setType] = useState(artwork.type);
  const [size, setSize] = useState(artwork.size || "");
  const [medium, setMedium] = useState(artwork.medium || "");
  const [price, setPrice] = useState(artwork.price ? artwork.price / 100 : 0);
  const [description, setDescription] = useState(artwork.description || "");
  const [imageUrl, setImageUrl] = useState(artwork.imageUrl);
  const [status, setStatus] = useState(artwork.status);
  const [featured, setFeatured] = useState(artwork.featured || false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onUpload(file);
    if (url) setImageUrl(url);
  }

  function handleSave() {
    onSave({
      ...artwork,
      title,
      type,
      size,
      medium,
      price: Math.round(price * 100),
      description,
      imageUrl,
      status,
      featured,
    });
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${accent}22` }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as "original" | "print")} style={inputStyle}>
            <option value="original">Original</option>
            <option value="print">Print</option>
          </select>
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "available" | "sold" | "reserved" | "unlisted")} style={inputStyle}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="reserved">Reserved</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Size</label>
          <input value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Medium</label>
          <input value={medium} onChange={(e) => setMedium(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Price (USD)</label>
          <input type="number" step="0.01" value={price || ""} onChange={(e) => setPrice(parseFloat(e.target.value || "0"))} style={inputStyle} />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ color: textDim, fontSize: 11, display: "block", marginBottom: 4 }}>Replace Image</label>
        <input type="file" accept="image/*" onChange={handleFile} style={{ color: textDim, fontSize: 13 }} />
        {uploading && <span style={{ color: accent, fontSize: 12, marginLeft: 8 }}>Uploading...</span>}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, color: text, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={handleSave} disabled={loading} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: accent, color: bg, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} style={{ padding: "8px 20px", borderRadius: 6, border: `1px solid ${textDim}`, background: "transparent", color: textDim, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
