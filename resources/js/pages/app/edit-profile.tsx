import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, Field, Input, Textarea, Btn, PageHeader } from "@/components/ui-bits";
import {
  User, Mail, Phone, Github, Linkedin, Globe, Camera,
  Loader2, CheckCircle, AlertCircle, ArrowLeft
} from "lucide-react";
import api from "@/lib/api";

export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    contact_number: "",
    github: "",
    linkedin: "",
    website: "",
  });

  // Load existing profile data
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/api/profile");
      return res.data.user;
    },
  });

  // Populate form once data is available
  useEffect(() => {
    if (!data) return;
    const profile = data.profile || {};
    const social = profile.social_links || {};
    const contact = profile.contact_info || {};
    setForm({
      name: data.name || "",
      bio: profile.bio || "",
      contact_number: contact.phone || "",
      github: social.github || "",
      linkedin: social.linkedin || "",
      website: social.website || "",
    });
  }, [data]);

  const profile = data?.profile || {};
  const avatar = avatarPreview
    || (profile.avatar_path ? `/storage/${profile.avatar_path}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.name || "U")}&background=random`);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const res = await api.put("/api/profile", values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/app/profile");
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Failed to update profile.");
      setSuccessMsg("");
    },
  });

  // Avatar upload mutation
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.post("/api/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccessMsg("Avatar updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    },
    onError: () => {
      setErrorMsg("Failed to upload avatar.");
    },
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show preview immediately
    setAvatarPreview(URL.createObjectURL(file));
    avatarMutation.mutate(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate(form);
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Profile" description="Update your public profile information.">
        <Btn variant="outline" size="sm" onClick={() => navigate("/app/profile")}>
          <ArrowLeft className="h-4 w-4" /> Back to profile
        </Btn>
      </PageHeader>

      {/* Feedback banners */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-blood/30 bg-blood/10 px-4 py-3 text-sm text-blood">
          <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar section */}
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold">Profile Picture</h2>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt="Avatar"
                className="h-20 w-20 rounded-2xl border-2 border-border object-cover"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -right-2 -bottom-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 transition"
                aria-label="Change avatar"
              >
                {avatarMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">{data?.name}</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {data?.roll_number} · {data?.department} · Batch {data?.batch}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click the camera icon to upload a new avatar (max 2 MB).
              </p>
            </div>
          </div>
        </Card>

        {/* Basic info */}
        <Card className="p-5 space-y-5">
          <h2 className="text-sm font-semibold">Basic Information</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full Name">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </Field>
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={data?.email} disabled className="pl-9 opacity-60 cursor-not-allowed" />
              </div>
            </Field>
            <Field label="Roll Number">
              <Input value={data?.roll_number} disabled className="opacity-60 cursor-not-allowed" />
            </Field>
            <Field label="Department">
              <Input value={data?.department} disabled className="opacity-60 cursor-not-allowed" />
            </Field>
          </div>
          <p className="text-xs text-muted-foreground">
            Email, roll number, and department cannot be changed. Contact admin for corrections.
          </p>
        </Card>

        {/* Bio */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold">About You</h2>
          <Field label="Bio" hint="Tell others a bit about yourself. Max 1000 characters.">
            <Textarea
              name="bio"
              rows={4}
              placeholder="Final-year CSE @ KUET. Interested in distributed systems..."
              value={form.bio}
              onChange={handleChange}
              maxLength={1000}
            />
            <p className="text-right text-[11px] text-muted-foreground">{form.bio.length} / 1000</p>
          </Field>
        </Card>

        {/* Contact */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold">Contact Information</h2>
          <Field label="Phone Number" hint="Your phone number is visible to other verified students.">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="contact_number"
                type="tel"
                placeholder="+880 1700 000000"
                value={form.contact_number}
                onChange={handleChange}
                className="pl-9"
              />
            </div>
          </Field>
        </Card>

        {/* Social links */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-semibold">Social Links</h2>
          <div className="space-y-4">
            <Field label="GitHub">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="github"
                  type="url"
                  placeholder="https://github.com/username"
                  value={form.github}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="LinkedIn">
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer" />
                <Input
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={form.linkedin}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
            </Field>
            <Field label="Personal Website">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="website"
                  type="url"
                  placeholder="https://yoursite.com"
                  value={form.website}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
            </Field>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <Btn type="button" variant="outline" onClick={() => navigate("/app/profile")}>
            Cancel
          </Btn>
          <Btn type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              "Save changes"
            )}
          </Btn>
        </div>
      </form>
    </div>
  );
}
