import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublishContentForm() {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <form id="publish-content-form" className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Content Title</Label>
        <Input id="title" placeholder="Give your content a descriptive title" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your content"
          className="min-h-32"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select a category</option>
          <option value="art">Digital Art</option>
          <option value="music">Music</option>
          <option value="writing">Writing</option>
          <option value="video">Video</option>
          <option value="photography">Photography</option>
          <option value="programming">Programming</option>
          <option value="design">Design</option>
          <option value="crafts">Crafts</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label>Content File</Label>
        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag & drop your content file here
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports images, audio, video, PDF, and more (max 500MB)
          </p>
          <Button variant="outline" type="button">
            Select File
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="premium"
          checked={isPremium}
          onCheckedChange={setIsPremium}
        />
        <Label htmlFor="premium">Premium Content</Label>
      </div>

      {isPremium && (
        <div className="space-y-2">
          <Label htmlFor="price">Price (ETN)</Label>
          <Input
            id="price"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="5.00"
          />
          <p className="text-sm text-muted-foreground">
            Set the price fans will pay to access this content.
          </p>
        </div>
      )}
    </form>
  );
}
