import { useRef, useState } from "react";
import { Plus, Search, Star, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useMenuItems,
  useMenuCategories,
  useToggleAvailability,
  useCreateMenuItem,
  useDeleteMenuItem,
  useUpdateMenuItem,
  useCreateCategory,
  useDeleteCategory,
  useUpdateMenuCategory,
} from "@/hooks/useMenu";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuItemSchema, MenuItemFormData } from "@/validations/menu";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadAPI } from "@/services/api/uploadapi";
import { MenuItem } from "@/types/admin";
import { CreateMenuItemRequest, MenuCategory } from "@/services/api/menu";
import { toast } from "sonner";

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addDialog, setAddDialog] = useState(false);
  const [manageCategoriesDialog, setManageCategoriesDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(
    null,
  );
  const debouncedSearch = useDebounce(search, 300);
  const { hasPermission } = useAuthStore();
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryImageUploading, setCategoryImageUploading] = useState(false);

  const { data: itemsData } = useMenuItems({
    category: categoryFilter === "all" ? undefined : categoryFilter,
  });
  const { data: categories } = useMenuCategories();
  const toggleMutation = useToggleAvailability();
  const createMutation = useCreateMenuItem();
  const deleteMutation = useDeleteMenuItem();
  const updateMenuItem = useUpdateMenuItem();

  // Category mutations
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const updateCategoryMutation = useUpdateMenuCategory();

  const items = itemsData?.data || [];

  const filtered = items.filter((item) => {
    if (
      debouncedSearch &&
      !item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
      return false;
    return true;
  });

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      categoryName: "",
      image: "",
      dietaryTags: [],
      isFeatured: false,
      isAvailable: true,
      variants: [],
    },
  });

  const onSubmitItem = (data: MenuItemFormData) => {
    createMutation.mutate(data as any, {
      onSuccess: () => {
        setAddDialog(false);
        form.reset();
      },
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageUploading(true);
      const url = await uploadAPI.uploadFile(file);
      form.setValue("image", url);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleCategoryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCategoryImageUploading(true);
      const url = await uploadAPI.uploadFile(file);
      setCategoryImage(url);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setCategoryImageUploading(false);
    }
  };

  const startEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryImage(category.image || "");
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryImage("");
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      // Update
      updateCategoryMutation.mutate(
        {
          id: editingCategory._id,
          data: {
            name: categoryName,
            description: categoryDescription,
            image: categoryImage,
          },
        },
        {
          onSuccess: () => {
            resetCategoryForm();
            setManageCategoriesDialog(false);
          },
        },
      );
    } else {
      // Create
      createCategoryMutation.mutate(
        {
          name: categoryName,
          description: categoryDescription,
          image: categoryImage,
          displayOrder: categories?.length || 0,
          isActive: true,
        },
        {
          onSuccess: () => {
            resetCategoryForm();
            setManageCategoriesDialog(false);
          },
        },
      );
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id, {
        onSuccess: () => {
          resetCategoryForm();
          setManageCategoriesDialog(false);
        },
      });
    }
  };

  function EditMenuItemForm({
    item,
    onSubmit,
  }: {
    item: MenuItem;
    onSubmit: (data: Partial<CreateMenuItemRequest>) => void;
  }) {
    const form = useForm({
      defaultValues: {
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
        dietaryTags: item.dietaryTags,
        stock: item.stock,
        isCatering: item.isCatering,
        variants: item.variants,
      },
    });

    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [editImageUploading, setEditImageUploading] = useState(false);

    const handleEditImageUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setEditImageUploading(true);
        const url = await uploadAPI.uploadFile(file);
        form.setValue("image", url);
      } catch {
        toast.error("Failed to upload image");
      } finally {
        setEditImageUploading(false);
      }
    };

    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input {...form.register("name")} />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea {...form.register("description")} />
        </div>

        <div>
          <Label>Price</Label>
          <Input
            type="number"
            {...form.register("price", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Image</Label>
          <input
            ref={editFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleEditImageUpload}
          />
          <div
            onClick={() =>
              !editImageUploading && editFileInputRef.current?.click()
            }
            className="h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            {editImageUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : form.watch("image") ? (
              <img
                src={form.watch("image")}
                alt="preview"
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <>
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Click to upload
                </span>
              </>
            )}
          </div>
        </div>

        <div>
          <Label>Category</Label>
          <Select
            value={form.watch("categoryId")}
            onValueChange={(v) => {
              const selected = categories?.find((c) => c._id === v);
              form.setValue("categoryId", v);
              form.setValue("categoryName", selected?.name ?? "");
            }}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {(categories || []).map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Stock</Label>
          <Input
            type="number"
            {...form.register("stock", { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label>Dietary Tags</Label>
          <div className="flex gap-4">
            {["vegan", "halal", "gluten-free"].map((tag) => (
              <div key={tag} className="flex items-center gap-1.5">
                <Checkbox
                  id={`edit-${tag}`}
                  checked={form.watch("dietaryTags")?.includes(tag)}
                  onCheckedChange={(checked) => {
                    const current = form.getValues("dietaryTags") || [];
                    form.setValue(
                      "dietaryTags",
                      checked
                        ? [...current, tag]
                        : current.filter((t) => t !== tag),
                    );
                  }}
                />
                <label htmlFor={`edit-${tag}`} className="text-xs capitalize">
                  {tag}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("isAvailable")}
              onCheckedChange={(v) => form.setValue("isAvailable", v)}
              className="scale-75"
            />
            <Label className="text-xs">Available</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("isFeatured")}
              onCheckedChange={(v) => form.setValue("isFeatured", v)}
              className="scale-75"
            />
            <Label className="text-xs">Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("isCatering")}
              onCheckedChange={(v) => form.setValue("isCatering", v)}
              className="scale-75"
            />
            <Label className="text-xs">Catering</Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={editImageUploading}
            className="w-full"
          >
            {updateMenuItem.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Categories</h2>
          {hasPermission("MANAGE_CATEGORIES") && (
            <Button
              size="sm"
              onClick={() => {
                resetCategoryForm();
                setManageCategoriesDialog(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Category
            </Button>
          )}
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="glass-card rounded-lg p-4 flex flex-col gap-3"
              >
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-32 w-full rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {hasPermission("MANAGE_CATEGORIES") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        startEditCategory(cat);
                        setManageCategoriesDialog(true);
                      }}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1.5" /> Edit
                    </Button>
                  )}
                  {hasPermission("MANAGE_CATEGORIES") && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCategory(cat._id)}
                      disabled={deleteCategoryMutation.isPending}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1.5" /> Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            No categories yet. Create one to get started!
          </p>
        )}
      </div>

      {/* Menu Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Menu Items</h2>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-transparent text-sm"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] h-9 text-sm bg-muted/50 border-transparent">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasPermission("CREATE_MENU_ITEM") && (
            <Button
              size="sm"
              className="h-9 text-xs"
              onClick={() => setAddDialog(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Item
            </Button>
          )}
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground text-center py-10">
              No items found for this category.
            </p>
          )}
          {filtered.map((item) => (
            <div
              key={item._id}
              className={cn(
                "glass-card rounded-xl overflow-hidden group transition-all",
                !item.isAvailable && "opacity-60",
              )}
            >
              <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">🍽️</span>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.categoryName}
                    </p>
                  </div>
                  <span className="text-sm font-bold font-mono text-primary">
                    ${item.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.dietaryTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 capitalize"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {item.isFeatured && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-warning/15 text-warning border-warning/25">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="text-xs font-medium">
                      {item.averageRating}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      ({item.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                    {hasPermission("EDIT_MENU_ITEM") && (
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({
                            id: item._id,
                            isAvailable: checked,
                          })
                        }
                        className="scale-75"
                      />
                    )}

                    {hasPermission("EDIT_MENU_ITEM") && (
                      <Button onClick={() => setEditingItem(item)}>Edit</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmitItem)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input
                {...form.register("name")}
                className="h-9 text-sm"
                placeholder="Item name"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                {...form.register("description")}
                className="text-sm min-h-[60px]"
                placeholder="Describe the item..."
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Price ($)</Label>
                <Input
                  type="number"
                  {...form.register("price")}
                  className="h-9 text-sm"
                />
                {form.formState.errors.price && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select
                  onValueChange={(v) => {
                    const selected = categories?.find((c) => c._id === v);
                    form.setValue("categoryId", v);
                    form.setValue("categoryName", selected?.name ?? "");
                  }}
                  value={form.watch("categoryId")}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories || []).map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div
                onClick={() => !imageUploading && fileInputRef.current?.click()}
                className="h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                {imageUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : form.watch("image") ? (
                  <img
                    src={form.watch("image")}
                    alt="preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Click to upload
                    </span>
                  </>
                )}
              </div>
              {form.formState.errors.image && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.image.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Dietary Tags</Label>
              <div className="flex gap-4">
                {["vegan", "halal", "gluten-free"].map((tag) => (
                  <div key={tag} className="flex items-center gap-1.5">
                    <Checkbox
                      id={tag}
                      checked={form.watch("dietaryTags")?.includes(tag)}
                      onCheckedChange={(checked) => {
                        const current = form.getValues("dietaryTags") || [];
                        form.setValue(
                          "dietaryTags",
                          checked
                            ? [...current, tag]
                            : current.filter((t) => t !== tag),
                        );
                      }}
                    />
                    <label htmlFor={tag} className="text-xs capitalize">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.watch("isFeatured")}
                  onCheckedChange={(v) => form.setValue("isFeatured", v)}
                  className="scale-75"
                />
                <Label className="text-xs">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.watch("isAvailable")}
                  onCheckedChange={(v) => form.setValue("isAvailable", v)}
                  className="scale-75"
                />
                <Label className="text-xs">Available</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <EditMenuItemForm
              item={editingItem}
              onSubmit={(formValues) => {
                updateMenuItem.mutate(
                  { id: editingItem._id, data: formValues },
                  {
                    onSuccess: () => setEditingItem(null),
                  },
                );
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Category Dialog */}
      <Dialog
        open={manageCategoriesDialog}
        onOpenChange={(open) => {
          setManageCategoriesDialog(open);
          if (!open) resetCategoryForm();
        }}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveCategory} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-xs">Category Name *</Label>
              <Input
                placeholder="e.g., Rice Dishes, Proteins..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="Brief description of this category..."
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="text-sm min-h-[60px]"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-xs">Image</Label>
              <input
                ref={categoryFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCategoryImageUpload}
              />
              <div
                onClick={() =>
                  !categoryImageUploading &&
                  categoryFileInputRef.current?.click()
                }
                className="h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
              >
                {categoryImageUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : categoryImage ? (
                  <img
                    src={categoryImage}
                    alt="preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Click to upload image
                    </span>
                  </>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetCategoryForm();
                  setManageCategoriesDialog(false);
                }}
              >
                Cancel
              </Button>

              {editingCategory && hasPermission("MANAGE_CATEGORIES") && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    handleDeleteCategory(editingCategory._id);
                    resetCategoryForm();
                    setManageCategoriesDialog(false);
                  }}
                  disabled={deleteCategoryMutation.isPending}
                >
                  {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              )}

              <Button
                type="submit"
                disabled={
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending ||
                  categoryImageUploading
                }
              >
                {editingCategory
                  ? updateCategoryMutation.isPending
                    ? "Saving..."
                    : "Save Changes"
                  : createCategoryMutation.isPending
                    ? "Creating..."
                    : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
