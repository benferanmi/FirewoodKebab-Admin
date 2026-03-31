import { useState } from "react";
import { Save, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHomeContent, useUpdateHomeContent, useGallery, useUploadGalleryImage, useDeleteGalleryImage } from "@/hooks/useContent";

export default function ContentPage() {
  const { data: homeContent } = useHomeContent();
  const updateHome = useUpdateHomeContent();
  const { data: gallery } = useGallery();
  const uploadImage = useUploadGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [heroTitle, setHeroTitle] = useState<string | undefined>();
  const [heroSubtitle, setHeroSubtitle] = useState<string | undefined>();

  const getTitle = () => heroTitle ?? homeContent?.heroTitle ?? "";
  const getSubtitle = () => heroSubtitle ?? homeContent?.heroSubtitle ?? "";

  const handleSaveHero = () => {
    updateHome.mutate({
      heroTitle: getTitle(),
      heroSubtitle: getSubtitle(),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const formData = new FormData();
      formData.append("file", file);
      uploadImage.mutate(formData);
    });
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="glass-card rounded-xl p-6 space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold">Hero Section</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Headline</Label>
            <Input value={getTitle()} onChange={(e) => setHeroTitle(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Subheadline</Label>
            <Textarea value={getSubtitle()} onChange={(e) => setHeroSubtitle(e.target.value)} className="text-sm min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Background Image</Label>
            <div className="h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
              <div className="text-center">
                <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Click to upload</p>
              </div>
            </div>
          </div>
        </div>
        <Button size="sm" onClick={handleSaveHero} disabled={updateHome.isPending}>
          <Save className="h-3.5 w-3.5 mr-1.5" />{updateHome.isPending ? "Saving..." : "Save Hero"}
        </Button>
      </div>

      {/* Gallery */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Gallery</h3>
          <div>
            <input type="file" id="gallery-upload" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
            <Button size="sm" className="h-8 text-xs" onClick={() => document.getElementById("gallery-upload")?.click()} disabled={uploadImage.isPending}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />{uploadImage.isPending ? "Uploading..." : "Upload Images"}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(gallery || []).length === 0 &&
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="group relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-info/5 aspect-square flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            ))}
          {(gallery || []).map((img) => (
            <div key={img.id} className="group relative rounded-lg overflow-hidden aspect-square">
              <img src={img.url} alt={img.caption || "Gallery"} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => deleteImage.mutate(img.id)}
                  disabled={deleteImage.isPending}
                >
                  <Trash2 className="h-3 w-3 mr-1" />Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
