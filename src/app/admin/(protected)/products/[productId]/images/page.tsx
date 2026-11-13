import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteProductImage, setPrimaryProductImage, uploadProductImage } from "../../../actions";

export const metadata: Metadata = { title: "Product images · Admin" };

type PageProps = { params: Promise<{ productId: string }>; searchParams: Promise<{ result?: string }> };

export default async function ProductImagesPage({ params, searchParams }: PageProps) {
  const [{ productId }, { result }, supabase] = await Promise.all([
    params, searchParams, createServerSupabaseClient(),
  ]);
  if (!supabase) return <section className="simple-page"><h1>Product images</h1><p>Connect Supabase to manage product assets.</p></section>;
  const [{ data: product, error: productError }, { data: images, error: imageError }] = await Promise.all([
    supabase.from("products").select("id,name,slug,status").eq("id", productId).maybeSingle(),
    supabase.from("product_images").select("id,product_id,storage_path,alt_text,sort_order,is_primary,created_at")
      .eq("product_id", productId).order("sort_order").order("created_at"),
  ]);
  if (productError || !product) notFound();
  if (imageError) return <section className="simple-page"><h1>Product images</h1><p>Image records could not be loaded. Check staff table and private Storage read policies.</p></section>;
  const rows = images ?? [];
  const signed = rows.length ? await supabase.storage.from("product-images").createSignedUrls(rows.map((item) => item.storage_path), 15 * 60) : { data: [], error: null };
  const signedByPath = new Map((signed.data ?? []).flatMap((item) => item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : []));
  const messages: Record<string, string> = {
    "image-saved": "Image uploaded.", "primary-saved": "Primary image updated.",
    "image-deleted": "Image removed.", "image-invalid": "Choose a supported image under 8 MiB and provide alt text.",
    "image-failed": "The image action failed. Check permissions and try again.",
    "image-row-delete-failed": "The image record could not be deleted; the storage file was left untouched.",
    "image-orphan-cleanup": "The image was removed from the catalogue, but its private storage file could not be deleted. Ask an administrator to clean up the orphaned object.",
    "image-primary-repair-needed": "The image was deleted but another primary image could not be selected. Set a primary image manually.",
  };
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">PRODUCT ASSETS</span><h1>Images</h1><p>{product.name} · {product.status}</p></div><Link href="/admin/products">← Back to products</Link></div>
    {result ? <p role="status" className={result.endsWith("saved") || result === "image-deleted" ? "admin-result-success" : "admin-result-error"}>{messages[result] ?? "The action could not be completed."}</p> : null}
    <form action={uploadProductImage} className="admin-editor admin-form-grid" encType="multipart/form-data">
      <input type="hidden" name="productId" value={product.id} />
      <h2 className="admin-full-field">Upload product image</h2>
      <label className="admin-full-field">Image file<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" required /></label>
      <label>Alternative text<input name="altText" maxLength={300} required placeholder="Front view of the product" /></label>
      <label>Sort order<input name="sortOrder" type="number" min={-100000} max={100000} step="1" defaultValue="0" /></label>
      <p className="admin-full-field">JPEG, PNG, WebP or AVIF; maximum 8 MiB. Files are stored in a private bucket. Published product images are delivered using short-lived signed URLs.</p>
      <div className="admin-full-field"><button className="button button-primary" type="submit">Upload image</button></div>
    </form>
    <div className="admin-image-grid">
      {rows.length === 0 ? <div className="empty-catalogue"><h2>No images yet</h2><p>Upload accurate product photographs before publishing this product.</p></div> : rows.map((item) => {
        const src = signedByPath.get(item.storage_path);
        return <article className="admin-image-card" key={item.id}>
          {src ? <Image src={src} alt={item.alt_text} width={640} height={480} unoptimized /> : <div className="admin-image-missing">Preview unavailable</div>}
          <div className="admin-image-card-copy"><strong>{item.alt_text}</strong><small>Order {item.sort_order} {item.is_primary ? "· Primary" : ""}</small></div>
          {!item.is_primary ? <form action={setPrimaryProductImage}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="imageId" value={item.id} /><button className="button button-small" type="submit">Make primary</button></form> : <span className="admin-primary-label">Primary image</span>}
          <form action={deleteProductImage}><input type="hidden" name="productId" value={product.id} /><input type="hidden" name="imageId" value={item.id} /><button className="text-button" type="submit">Delete image</button></form>
        </article>;
      })}
    </div>
  </section>;
}
