import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import client from "@/services/api/client";
import { usePageContent, useUpdatePageContent } from "@/hooks/useContent";
import {
  IAboutContent,
  ICateringContent,
  IContactContent,
} from "@/types/admin";

// ── CONTACT TAB ─────────────────────────────────────────────────────────────
function ContactTab() {
  const { data: pageData } = usePageContent("contact");
  const updateContent = useUpdatePageContent();

  const [form, setForm] = useState<IContactContent>({
    heroHeading: "",
    heroText: "",
  });

  useEffect(() => {
    if (pageData?.contact) setForm(pageData.contact);
  }, [pageData]);

  return (
    <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
      <h3 className="text-sm font-semibold">Contact Page Content</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Hero Heading</Label>
          <Input
            value={form.heroHeading}
            onChange={(e) =>
              setForm((p) => ({ ...p, heroHeading: e.target.value }))
            }
            placeholder="e.g., Get in Touch"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Hero Text</Label>
          <Textarea
            value={form.heroText}
            onChange={(e) =>
              setForm((p) => ({ ...p, heroText: e.target.value }))
            }
            placeholder="Brief description shown below the heading"
            rows={4}
            className="text-sm resize-none"
          />
        </div>

        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-xs font-semibold mb-2">Preview</p>
          <h2 className="text-lg font-bold">
            {form.heroHeading || "[Heading]"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {form.heroText || "[Text]"}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={() =>
          updateContent.mutate({
            page: "contact",
            data: { pageSlug: "contact", contact: form },
          })
        }
        disabled={updateContent.isPending}
      >
        <Save className="h-3.5 w-3.5 mr-1.5" />
        {updateContent.isPending ? "Saving..." : "Save Contact Content"}
      </Button>
    </div>
  );
}

// ── CATERING TAB ─────────────────────────────────────────────────────────────
const DEFAULT_CATERING_ICONS = [
  "UtensilsCrossed",
  "Users",
  "Calendar",
  "Star",
  "Flame",
  "Award",
];

function CateringTab() {
  const { data: pageData } = usePageContent("catering");
  const updateContent = useUpdatePageContent();

  const [form, setForm] = useState<ICateringContent>({
    heroHeading: "",
    heroText: "",
    features: [],
  });

  useEffect(() => {
    if (pageData?.catering) setForm(pageData.catering);
  }, [pageData]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-card rounded-xl p-6 space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold">Hero Section</h3>

        <div className="space-y-2">
          <Label className="text-xs">Hero Heading</Label>
          <Input
            value={form.heroHeading}
            onChange={(e) =>
              setForm((p) => ({ ...p, heroHeading: e.target.value }))
            }
            placeholder="e.g., Catering Services"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Hero Text</Label>
          <Textarea
            value={form.heroText}
            onChange={(e) =>
              setForm((p) => ({ ...p, heroText: e.target.value }))
            }
            placeholder="Subheading shown in the hero section"
            rows={3}
            className="text-sm resize-none"
          />
        </div>
      </div>

      {/* Features */}
      <div className="glass-card rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Feature Cards</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Replaces the hardcoded cards on the catering page
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setForm((p) => ({
                ...p,
                features: [
                  ...(p.features || []),
                  { title: "", description: "", icon: "Star" },
                ],
              }))
            }
          >
            Add Feature
          </Button>
        </div>

        <div className="space-y-3">
          {form.features?.map((feat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-border space-y-3"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={feat.title}
                    onChange={(e) => {
                      const next = [...(form.features || [])];
                      next[idx].title = e.target.value;
                      setForm((p) => ({ ...p, features: next }));
                    }}
                    placeholder="e.g., Custom Menus"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Icon</Label>
                  <select
                    value={feat.icon}
                    onChange={(e) => {
                      const next = [...(form.features || [])];
                      next[idx].icon = e.target.value;
                      setForm((p) => ({ ...p, features: next }));
                    }}
                    className="w-full h-8 text-xs px-2 rounded-md border border-input bg-background"
                  >
                    <option value="UtensilsCrossed">UtensilsCrossed</option>
                    <option value="Users">Users</option>
                    <option value="Calendar">Calendar</option>
                    <option value="Star">Star</option>
                    <option value="Flame">Flame</option>
                    <option value="Award">Award</option>
                    <option value="Heart">Heart</option>
                    <option value="Zap">Zap</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={feat.description}
                  onChange={(e) => {
                    const next = [...(form.features || [])];
                    next[idx].description = e.target.value;
                    setForm((p) => ({ ...p, features: next }));
                  }}
                  placeholder="Describe this feature..."
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    features: p.features?.filter((_, i) => i !== idx) || [],
                  }))
                }
                className="w-full"
              >
                Remove Feature
              </Button>
            </div>
          ))}

          {form.features?.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No features yet. Add one above — or leave empty to use the page
              defaults.
            </p>
          )}
        </div>
      </div>

      <Button
        size="sm"
        onClick={() =>
          updateContent.mutate({
            page: "catering",
            data: { pageSlug: "catering", catering: form },
          })
        }
        disabled={updateContent.isPending}
      >
        <Save className="h-3.5 w-3.5 mr-1.5" />
        {updateContent.isPending ? "Saving..." : "Save Catering Content"}
      </Button>
    </div>
  );
}

export default function ContentManagerPage() {
  const { data: aboutPageData } = usePageContent("about");

  const updateAboutContent = useUpdatePageContent();

  const [aboutContent, setAboutContent] = useState<IAboutContent>({
    heroHeading: "",
    heroSubheading: "",
    storyText: "",
    stats: [],
    values: [],
    team: [],
  });
  useEffect(() => {
    if (aboutPageData?.about) {
      setAboutContent(aboutPageData.about);
    }
  }, [aboutPageData]);
  const handleSaveAbout = () => {
    updateAboutContent.mutate({
      page: "about",
      data: { pageSlug: "about", about: aboutContent },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <p className="text-muted-foreground">
          Manage the text and content on your pages.
        </p>
      </div>

      <Tabs defaultValue="about" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="catering">Catering</TabsTrigger>
        </TabsList>

        {/* ── ABOUT ────────────────────────────────────────────────────*/}
        <TabsContent value="about">
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="glass-card rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-semibold">Hero Section</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Hero Heading</Label>
                  <Input
                    value={aboutContent.heroHeading || ""}
                    onChange={(e) =>
                      setAboutContent((p) => ({
                        ...p,
                        heroHeading: e.target.value,
                      }))
                    }
                    placeholder="e.g., Fired by Passion. Served with Purpose."
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Hero Subheading</Label>
                  <Input
                    value={aboutContent.heroSubheading || ""}
                    onChange={(e) =>
                      setAboutContent((p) => ({
                        ...p,
                        heroSubheading: e.target.value,
                      }))
                    }
                    placeholder="Brief intro text"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Story Section */}
            <div className="glass-card rounded-xl p-6 space-y-5">
              <h3 className="text-sm font-semibold">Story Section</h3>

              <div className="space-y-2">
                <Label className="text-xs">Story Text (Paragraphs)</Label>
                <Textarea
                  value={aboutContent.storyText || ""}
                  onChange={(e) =>
                    setAboutContent((p) => ({
                      ...p,
                      storyText: e.target.value,
                    }))
                  }
                  placeholder="Tell your restaurant's story here. Use line breaks for paragraphs."
                  rows={6}
                  className="text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Press Enter twice to create paragraph breaks. This
                  text appears in structured data for SEO.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <p className="text-xs font-semibold mb-2">Preview</p>
                <div className="space-y-2 text-xs">
                  {(aboutContent.storyText || "")
                    .split("\n\n")
                    .map((para, i) => (
                      <p
                        key={i}
                        className="text-muted-foreground leading-relaxed"
                      >
                        {para}
                      </p>
                    ))}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="glass-card rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Stats Section</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setAboutContent((p) => ({
                      ...p,
                      stats: [...(p.stats || []), { value: "", label: "" }],
                    }))
                  }
                >
                  Add Stat
                </Button>
              </div>

              <div className="space-y-3">
                {aboutContent.stats?.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Value</Label>
                        <Input
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...(aboutContent.stats || [])];
                            newStats[idx].value = e.target.value;
                            setAboutContent((p) => ({ ...p, stats: newStats }));
                          }}
                          placeholder="e.g., 6+"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...(aboutContent.stats || [])];
                            newStats[idx].label = e.target.value;
                            setAboutContent((p) => ({ ...p, stats: newStats }));
                          }}
                          placeholder="e.g., Years of Service"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setAboutContent((p) => ({
                          ...p,
                          stats: p.stats?.filter((_, i) => i !== idx) || [],
                        }));
                      }}
                      className="w-full"
                    >
                      Remove Stat
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Values Section */}
            <div className="glass-card rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Values Section</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setAboutContent((p) => ({
                      ...p,
                      values: [
                        ...(p.values || []),
                        { title: "", description: "", icon: "Heart" },
                      ],
                    }))
                  }
                >
                  Add Value
                </Button>
              </div>

              <div className="space-y-3">
                {aboutContent.values?.map((value, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border space-y-3"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs">Value Title</Label>
                      <Input
                        value={value.title}
                        onChange={(e) => {
                          const newValues = [...(aboutContent.values || [])];
                          newValues[idx].title = e.target.value;
                          setAboutContent((p) => ({ ...p, values: newValues }));
                        }}
                        placeholder="e.g., Authentic Flavors"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={value.description}
                        onChange={(e) => {
                          const newValues = [...(aboutContent.values || [])];
                          newValues[idx].description = e.target.value;
                          setAboutContent((p) => ({ ...p, values: newValues }));
                        }}
                        placeholder="Describe this value..."
                        rows={3}
                        className="text-xs resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Icon (Lucide Icon Name)</Label>
                      <select
                        value={value.icon}
                        onChange={(e) => {
                          const newValues = [...(aboutContent.values || [])];
                          newValues[idx].icon = e.target.value;
                          setAboutContent((p) => ({ ...p, values: newValues }));
                        }}
                        className="w-full h-8 text-xs px-2 rounded-md border border-input bg-background"
                      >
                        <option value="Heart">Heart (Love)</option>
                        <option value="Flame">Flame (Fire/Passion)</option>
                        <option value="Users">Users (Community)</option>
                        <option value="Award">Award (Quality)</option>
                        <option value="Star">Star</option>
                        <option value="Zap">Zap (Energy)</option>
                        <option value="Target">Target (Focus)</option>
                        <option value="Leaf">Leaf (Natural)</option>
                        <option value="CheckCircle">CheckCircle (Trust)</option>
                      </select>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setAboutContent((p) => ({
                          ...p,
                          values: p.values?.filter((_, i) => i !== idx) || [],
                        }));
                      }}
                      className="w-full"
                    >
                      Remove Value
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Section */}
            <div className="glass-card rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Team Members</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setAboutContent((p) => ({
                      ...p,
                      team: [
                        ...(p.team || []),
                        { name: "", role: "", bio: "", image: "" },
                      ],
                    }))
                  }
                >
                  Add Member
                </Button>
              </div>

              <div className="space-y-3">
                {aboutContent.team?.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border space-y-3"
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) => {
                            const newTeam = [...(aboutContent.team || [])];
                            newTeam[idx].name = e.target.value;
                            setAboutContent((p) => ({ ...p, team: newTeam }));
                          }}
                          placeholder="e.g., Chef Adaeze Okafor"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Role/Position</Label>
                        <Input
                          value={member.role}
                          onChange={(e) => {
                            const newTeam = [...(aboutContent.team || [])];
                            newTeam[idx].role = e.target.value;
                            setAboutContent((p) => ({ ...p, team: newTeam }));
                          }}
                          placeholder="e.g., Head Chef & Founder"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Bio</Label>
                      <Textarea
                        value={member.bio}
                        onChange={(e) => {
                          const newTeam = [...(aboutContent.team || [])];
                          newTeam[idx].bio = e.target.value;
                          setAboutContent((p) => ({ ...p, team: newTeam }));
                        }}
                        placeholder="Short bio for this team member..."
                        rows={2}
                        className="text-xs resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Image URL</Label>
                      <Input
                        value={member.image}
                        onChange={(e) => {
                          const newTeam = [...(aboutContent.team || [])];
                          newTeam[idx].image = e.target.value;
                          setAboutContent((p) => ({ ...p, team: newTeam }));
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="h-8 text-xs"
                      />
                      {member.image && (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setAboutContent((p) => ({
                          ...p,
                          team: p.team?.filter((_, i) => i !== idx) || [],
                        }));
                      }}
                      className="w-full"
                    >
                      Remove Member
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              size="sm"
              onClick={handleSaveAbout}
              disabled={updateAboutContent.isPending}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {updateAboutContent.isPending
                ? "Saving..."
                : "Save About Content"}
            </Button>
          </div>
        </TabsContent>

        {/* ── CONTACT ────────────────────────────────────────────────────*/}
        <TabsContent value="contact">
          <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
            <ContactTab />
          </div>
        </TabsContent>

        {/* ── CATERING ────────────────────────────────────────────────────*/}
        <TabsContent value="catering">
          <div className="glass-card rounded-xl p-6 space-y-5 max-w-2xl">
            <CateringTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
