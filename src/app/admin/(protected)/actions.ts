"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getStorePrincipal } from "@/lib/supabase/authz";
import { parseHmacSecret } from "@/lib/checkout/security";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifiedProductImageExtension } from "@/lib/security/image-signature";

const CATALOGUE_STATUSES = new Set(["draft", "review", "published", "archived"]);
const AVAILABILITY = new Set([
  "unknown", "in_stock", "low_stock", "out_of_stock", "availability_on_request",
  "backorder", "discontinued", "build_to_order",
]);
const TRACKING_MODES = new Set(["unknown", "tracked", "untracked"]);
const FULFILMENT = new Set(["processing", "packed", "shipped", "delivered"]);

function text(form: FormData, key: string, max: number): string | null {
  const raw = form.get(key);
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return value.length <= max ? value : null;
}

function optionalText(form: FormData, key: string, max: number): string | null | undefined {
  const raw = form.get(key);
  if (raw === null || raw === "") return null;
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  return value.length <= max ? (value || null) : undefined;
}

function integer(form: FormData, key: string, min: number, max: number): number | null {
  const value = text(form, key, 30);
  if (!value || !/^-?\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

async function requireStaff() {
  const principal = await getStorePrincipal();
  if (!principal) redirect("/admin/login");
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/admin/login?reason=not-configured");
  return { principal, supabase };
}

function finish(path: string, result = "saved"): never {
  revalidatePath(path);
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`${path}?result=${result}`);
}

export async function uploadProductImage(form: FormData) {
  const { supabase } = await requireStaff();
  const productId = text(form, "productId", 36);
  const altText = text(form, "altText", 300);
  const sortOrder = integer(form, "sortOrder", -100_000, 100_000) ?? 0;
  const file = form.get("image");
  if (!productId || !altText || !(file instanceof File) || file.size < 12 || file.size > 8 * 1024 * 1024) {
    finish("/admin/products", "image-invalid");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = verifiedProductImageExtension(file.type, bytes);
  if (!extension) finish("/admin/products", "image-invalid");

  const { data: product, error: productError } = await supabase.from("products").select("id").eq("id", productId).maybeSingle();
  if (productError || !product) finish("/admin/products", "image-failed");
  const { data: existing, error: imageReadError } = await supabase.from("product_images").select("id").eq("product_id", productId).limit(1);
  if (imageReadError) finish("/admin/products", "image-failed");

  const storagePath = `${productId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("product-images").upload(storagePath, bytes, {
    contentType: file.type, cacheControl: "3600", upsert: false,
  });
  if (uploadError) finish("/admin/products", "image-failed");

  const { error: rowError } = await supabase.from("product_images").insert({
    product_id: productId, storage_path: storagePath, alt_text: altText,
    sort_order: sortOrder, is_primary: (existing ?? []).length === 0,
  });
  if (rowError) {
    await supabase.storage.from("product-images").remove([storagePath]);
    finish("/admin/products", "image-failed");
  }
  revalidatePath(`/admin/products/${productId}/images`);
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`/admin/products/${productId}/images?result=image-saved`);
}

export async function createProduct(form: FormData) {
  const { supabase } = await requireStaff();
  const name = text(form, "name", 180);
  const slug = text(form, "slug", 180);
  const sku = optionalText(form, "sku", 100);
  const categoryId = optionalText(form, "categoryId", 36);
  const brand = optionalText(form, "brand", 120);
  const shortDescription = optionalText(form, "shortDescription", 300);
  const description = optionalText(form, "description", 5000);
  const priceRaw = text(form, "priceBdt", 20);
  const status = text(form, "status", 20);
  const availability = text(form, "availability", 40);
  const price = priceRaw === null || priceRaw === "" ? null : integer(form, "priceBdt", 1, 1_000_000_000);

  if (!name || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    || sku === undefined || categoryId === undefined || brand === undefined || shortDescription === undefined
    || description === undefined || (priceRaw !== null && priceRaw !== "" && price === null)
    || !status || !CATALOGUE_STATUSES.has(status) || !availability || !AVAILABILITY.has(availability)) {
    finish("/admin/products", "invalid");
  }
  if (status === "published" && (!categoryId || price === null)) finish("/admin/products", "needs-review");

  const { error } = await supabase.from("products").insert({
    name, slug, sku, category_id: categoryId, brand, short_description: shortDescription,
    description, price_bdt: price, status, public_availability: availability,
    orderable: form.get("orderable") === "on" && availability !== "unknown" && availability !== "discontinued",
  });
  if (error) finish("/admin/products", "save-failed");
  finish("/admin/products");
}

export async function updateProduct(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 36);
  const name = text(form, "name", 180);
  const slug = text(form, "slug", 180);
  const sku = optionalText(form, "sku", 100);
  const categoryId = optionalText(form, "categoryId", 36);
  const brand = optionalText(form, "brand", 120);
  const shortDescription = optionalText(form, "shortDescription", 300);
  const description = optionalText(form, "description", 5000);
  const priceRaw = text(form, "priceBdt", 20);
  const status = text(form, "status", 20);
  const availability = text(form, "availability", 40);
  const price = priceRaw === null || priceRaw === "" ? null : integer(form, "priceBdt", 1, 1_000_000_000);
  if (!id || !name || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    || sku === undefined || categoryId === undefined || brand === undefined || shortDescription === undefined
    || description === undefined || (priceRaw !== null && priceRaw !== "" && price === null)
    || !status || !CATALOGUE_STATUSES.has(status) || !availability || !AVAILABILITY.has(availability)) {
    finish("/admin/products", "invalid");
  }
  if (status === "published" && (!categoryId || price === null)) finish("/admin/products", "needs-review");

  const { error } = await supabase.from("products").update({
    name, slug, sku, category_id: categoryId, brand, short_description: shortDescription,
    description, price_bdt: price, status, public_availability: availability,
    orderable: form.get("orderable") === "on" && availability !== "unknown" && availability !== "discontinued",
  }).eq("id", id);
  if (error) finish("/admin/products", "save-failed");
  finish("/admin/products");
}

function optionValues(form: FormData): Record<string, string> | null {
  const raw = text(form, "optionValues", 2000);
  if (raw === null) return null;
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const entries = Object.entries(parsed as Record<string, unknown>);
  if (entries.length > 10) return null;
  const clean: Record<string, string> = {};
  for (const [key, value] of entries) {
    const normalizedKey = key.trim();
    if (!normalizedKey || normalizedKey.length > 40 || typeof value !== "string" || !value.trim() || value.trim().length > 100) return null;
    clean[normalizedKey] = value.trim();
  }
  return clean;
}

export async function createProductVariant(form: FormData) {
  const { supabase } = await requireStaff();
  const productId = text(form, "productId", 36);
  const name = text(form, "name", 120);
  const sku = optionalText(form, "sku", 100);
  const rawPrice = text(form, "priceOverrideBdt", 20);
  const price = rawPrice === null || rawPrice === "" ? null : integer(form, "priceOverrideBdt", 1, 1_000_000_000);
  const values = optionValues(form);
  const sortOrder = integer(form, "sortOrder", -100_000, 100_000) ?? 0;
  if (!productId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId)
    || !name || sku === undefined || values === null || (rawPrice !== null && rawPrice !== "" && price === null)) {
    finish("/admin/products", "variant-invalid");
  }
  const { data: product, error: productError } = await supabase.from("products").select("id").eq("id", productId).maybeSingle();
  if (productError || !product) finish("/admin/products", "variant-failed");
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId, name, sku, option_values: values, price_override_bdt: price,
    is_active: form.get("isActive") === "on", sort_order: sortOrder,
  });
  if (error) finish(`/admin/products/${productId}/variants`, "variant-failed");
  revalidatePath(`/admin/products/${productId}/variants`);
  revalidatePath(`/products`);
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`/admin/products/${productId}/variants?result=variant-saved`);
}

export async function updateProductVariant(form: FormData) {
  const { supabase } = await requireStaff();
  const productId = text(form, "productId", 36);
  const variantId = text(form, "variantId", 36);
  const name = text(form, "name", 120);
  const sku = optionalText(form, "sku", 100);
  const rawPrice = text(form, "priceOverrideBdt", 20);
  const price = rawPrice === null || rawPrice === "" ? null : integer(form, "priceOverrideBdt", 1, 1_000_000_000);
  const values = optionValues(form);
  const sortOrder = integer(form, "sortOrder", -100_000, 100_000) ?? 0;
  if (!productId || !variantId || !/^[0-9a-f-]{36}$/i.test(productId) || !/^[0-9a-f-]{36}$/i.test(variantId)
    || !name || sku === undefined || values === null || (rawPrice !== null && rawPrice !== "" && price === null)) {
    finish("/admin/products", "variant-invalid");
  }
  const { error } = await supabase.from("product_variants").update({
    name, sku, option_values: values, price_override_bdt: price,
    is_active: form.get("isActive") === "on", sort_order: sortOrder,
  }).eq("id", variantId).eq("product_id", productId);
  if (error) finish(`/admin/products/${productId}/variants`, "variant-failed");
  revalidatePath(`/admin/products/${productId}/variants`);
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`/admin/products/${productId}/variants?result=variant-saved`);
}

export async function createCategory(form: FormData) {
  const { supabase } = await requireStaff();
  const name = text(form, "name", 120);
  const slug = text(form, "slug", 120);
  const description = optionalText(form, "description", 1000);
  const parentId = optionalText(form, "parentId", 36);
  const sortOrder = integer(form, "sortOrder", -100_000, 100_000);
  const status = text(form, "status", 20);
  if (!name || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    || description === undefined || parentId === undefined || sortOrder === null
    || !status || !CATALOGUE_STATUSES.has(status)) finish("/admin/categories", "invalid");
  const { error } = await supabase.from("categories").insert({
    name, slug, description, parent_id: parentId, sort_order: sortOrder, status,
  });
  if (error) finish("/admin/categories", "save-failed");
  finish("/admin/categories");
}

export async function updateCategory(form: FormData) {
  const { supabase } = await requireStaff();
  const id = text(form, "id", 36);
  const name = text(form, "name", 120);
  const slug = text(form, "slug", 120);
  const description = optionalText(form, "description", 1000);
  const parentId = optionalText(form, "parentId", 36);
  const sortOrder = integer(form, "sortOrder", -100_000, 100_000);
  const status = text(form, "status", 20);
  if (!id || !name || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    || description === undefined || parentId === undefined || parentId === id || sortOrder === null
    || !status || !CATALOGUE_STATUSES.has(status)) finish("/admin/categories", "invalid");
  const { error } = await supabase.from("categories").update({
    name, slug, description, parent_id: parentId, sort_order: sortOrder, status,
  }).eq("id", id);
  if (error) finish("/admin/categories", "save-failed");
  finish("/admin/categories");
}

export async function configureInventory(form: FormData) {
  const { supabase } = await requireStaff();
  const productId = text(form, "productId", 36);
  const mode = text(form, "trackingMode", 20);
  const quantityText = text(form, "quantityOnHand", 30);
  const thresholdText = text(form, "lowStockThreshold", 30);
  const reason = text(form, "reason", 500);
  if (!productId || !mode || !TRACKING_MODES.has(mode) || !reason || reason.length < 3) finish("/admin/inventory", "invalid");
  const quantity = mode === "tracked" ? integer(form, "quantityOnHand", 0, 1_000_000_000) : null;
  const threshold = mode === "tracked" && thresholdText !== null && thresholdText !== ""
    ? integer(form, "lowStockThreshold", 0, 1_000_000_000) : null;
  if (mode === "tracked" && (quantity === null || (thresholdText !== null && thresholdText !== "" && threshold === null))) finish("/admin/inventory", "invalid");
  if (mode !== "tracked" && quantityText !== null && quantityText !== "") finish("/admin/inventory", "invalid");
  const { error } = await supabase.rpc("configure_inventory_tracking", {
    p_product_id: productId, p_tracking_mode: mode, p_quantity_on_hand: quantity,
    p_low_stock_threshold: threshold, p_reason: reason,
  });
  if (error) finish("/admin/inventory", "save-failed");
  finish("/admin/inventory");
}

export async function adjustInventory(form: FormData) {
  const { supabase } = await requireStaff();
  const productId = text(form, "productId", 36);
  const delta = integer(form, "quantityDelta", -1_000_000_000, 1_000_000_000);
  const reason = text(form, "reason", 500);
  if (!productId || delta === null || delta === 0 || !reason || reason.length < 3) finish("/admin/inventory", "invalid");
  const { error } = await supabase.rpc("adjust_inventory", {
    p_product_id: productId, p_quantity_delta: delta, p_reason: reason,
  });
  if (error) finish("/admin/inventory", "save-failed");
  finish("/admin/inventory");
}

export async function confirmOrderStock(form: FormData) {
  const { supabase } = await requireStaff();
  const orderId = text(form, "orderId", 36);
  const available = form.get("available") === "yes";
  const note = text(form, "note", 500);
  if (!orderId || !note || note.length < 3) finish("/admin/orders", "invalid");
  const { error } = await supabase.rpc("confirm_order_stock", {
    p_order_id: orderId, p_available: available, p_note: note,
  });
  if (error) finish("/admin/orders", "action-failed");
  finish("/admin/orders");
}

export async function cancelOrder(form: FormData) {
  const { supabase } = await requireStaff();
  const orderId = text(form, "orderId", 36);
  const reason = text(form, "reason", 500);
  if (!orderId || !reason || reason.length < 3) finish("/admin/orders", "invalid");
  const { error } = await supabase.rpc("cancel_order_and_release_reservations", {
    p_order_id: orderId, p_reason: reason,
  });
  if (error) finish("/admin/orders", "action-failed");
  finish("/admin/orders");
}

export async function updateFulfilment(form: FormData) {
  const { supabase } = await requireStaff();
  const orderId = text(form, "orderId", 36);
  const status = text(form, "status", 20);
  const note = optionalText(form, "note", 500);
  if (!orderId || !status || !FULFILMENT.has(status) || note === undefined) finish("/admin/orders", "invalid");
  const { error } = await supabase.rpc("update_order_fulfilment_status", {
    p_order_id: orderId, p_next_status: status, p_note: note,
  });
  if (error) finish("/admin/orders", "action-failed");
  finish("/admin/orders");
}

export async function verifyPayment(form: FormData) {
  const { principal, supabase } = await requireStaff();
  if (principal.role !== "admin") redirect("/admin?reason=admin-only");
  const submissionId = text(form, "submissionId", 36);
  const result = text(form, "result", 20);
  const reason = optionalText(form, "rejectionReason", 500);
  const note = optionalText(form, "note", 500);
  if (!submissionId || (result !== "verified" && result !== "rejected") || reason === undefined || note === undefined
    || (result === "rejected" && (!reason || reason.length < 3))) finish("/admin/payments", "invalid");
  const { error } = await supabase.rpc("verify_manual_payment", {
    p_submission_id: submissionId, p_result: result, p_rejection_reason: reason, p_note: note,
  });
  if (error) finish("/admin/payments", "action-failed");
  finish("/admin/payments");
}

export async function setCheckoutEnabled(form: FormData) {
  const { principal, supabase } = await requireStaff();
  if (principal.role !== "admin") redirect("/admin?reason=admin-only");
  const enabled = form.get("enabled") === "on";
  if (enabled) {
    if (!parseHmacSecret(process.env.APP_HMAC_SECRET) || !createAdminSupabaseClient()) {
      finish("/admin/settings", "checkout-server-not-ready");
    }
    const [{ data: zones }, { data: methods }] = await Promise.all([
      supabase.from("delivery_zones").select("id").eq("is_enabled", true).not("delivery_charge_bdt", "is", null).limit(1),
      supabase.from("payment_method_settings").select("method").eq("is_enabled", true).not("receiving_number", "is", null).not("customer_instructions", "is", null).limit(1),
    ]);
    if (!zones?.length || !methods?.length) finish("/admin/settings", "checkout-prerequisites");
  }
  const { error } = await supabase.from("store_settings").update({ checkout_enabled: enabled, updated_by: principal.id }).eq("singleton", true);
  if (error) finish("/admin/settings", "save-failed");
  finish("/admin/settings");
}

export async function moderateCustomerReview(form: FormData) {
  const { principal } = await requireStaff();
  const reviewId = text(form, "reviewId", 36);
  const status = text(form, "status", 12);
  if (!reviewId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reviewId)
    || (status !== "approved" && status !== "rejected")) finish("/admin/reviews", "invalid");
  const admin = createAdminSupabaseClient();
  if (!admin) finish("/admin/reviews", "server-not-configured");
  const { data, error } = await admin.from("customer_reviews").update({
    status, moderator_user_id: principal.id, moderated_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", reviewId).eq("status", "pending").select("id").maybeSingle();
  if (error || !data) finish("/admin/reviews", "action-failed");
  finish("/admin/reviews");
}

export async function signOutAdmin() {
  const supabase = await createServerSupabaseClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updatePaymentSettings(form: FormData) {
  const { principal, supabase } = await requireStaff();
  if (principal.role !== "admin") redirect("/admin?reason=admin-only");
  const method = text(form, "method", 10);
  const receivingNumber = optionalText(form, "receivingNumber", 32);
  const instructions = optionalText(form, "instructions", 500);
  const enabled = form.get("enabled") === "on";
  if ((method !== "bkash" && method !== "nagad") || receivingNumber === undefined || instructions === undefined
    || (enabled && (!receivingNumber || !instructions))) finish("/admin/settings", "invalid");
  const { error } = await supabase.from("payment_method_settings").update({
    is_enabled: enabled, receiving_number: receivingNumber, customer_instructions: instructions,
    updated_by: principal.id,
  }).eq("method", method);
  if (error) finish("/admin/settings", "save-failed");
  finish("/admin/settings");
}

export async function updateDeliveryZone(form: FormData) {
  const { principal, supabase } = await requireStaff();
  if (principal.role !== "admin") redirect("/admin?reason=admin-only");
  const id = optionalText(form, "id", 36);
  const code = text(form, "code", 80);
  const name = text(form, "name", 120);
  const coverage = optionalText(form, "coverage", 500);
  const charge = integer(form, "chargeBdt", 0, 1_000_000);
  const enabled = form.get("enabled") === "on";
  if (id === undefined || code === null || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) || !name || coverage === undefined
    || (enabled && charge === null)) finish("/admin/settings", "invalid");
  const payload = { code, name, coverage_description: coverage, delivery_charge_bdt: charge, is_enabled: enabled };
  const query = id
    ? supabase.from("delivery_zones").update(payload).eq("id", id)
    : supabase.from("delivery_zones").insert(payload);
  const { error } = await query;
  if (error) finish("/admin/settings", "save-failed");
  finish("/admin/settings");
}


export async function setPrimaryProductImage(form: FormData) {
  const { supabase } = await requireStaff();
  const productId = text(form, "productId", 36);
  const imageId = text(form, "imageId", 36);
  if (!productId || !imageId) finish("/admin/products", "invalid");
  const { error } = await supabase.rpc("set_primary_product_image", {
    p_product_id: productId,
    p_image_id: imageId,
  });
  if (error) finish(`/admin/products/${productId}/images`, "image-failed");
  revalidatePath(`/admin/products/${productId}/images`);
  revalidatePath(`/products`);
  revalidatePath("/");
  redirect(`/admin/products/${productId}/images?result=primary-saved`);
}

export async function deleteProductImage(form: FormData) {
  const { supabase } = await requireStaff();
  const productId = text(form, "productId", 36);
  const imageId = text(form, "imageId", 36);
  if (!productId || !imageId) finish("/admin/products", "invalid");
  const { data: image, error: readError } = await supabase.from("product_images")
    .select("id,product_id,storage_path").eq("id", imageId).eq("product_id", productId).maybeSingle();
  if (readError || !image) finish(`/admin/products/${productId}/images`, "image-failed");
  // Remove the catalogue row first so an object-cleanup failure cannot leave a broken image URL public.
  const { error: rowError } = await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
  if (rowError) finish(`/admin/products/${productId}/images`, "image-row-delete-failed");
  const { error: storageError } = await supabase.storage.from("product-images").remove([image.storage_path]);
  const { data: remaining } = await supabase.from("product_images").select("id")
    .eq("product_id", productId).order("sort_order").limit(1);
  if (remaining?.[0]) {
    const { error: primaryError } = await supabase.rpc("set_primary_product_image", {
      p_product_id: productId, p_image_id: remaining[0].id,
    });
    if (primaryError) finish(`/admin/products/${productId}/images`, "image-primary-repair-needed");
  }
  revalidatePath(`/admin/products/${productId}/images`);
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`/admin/products/${productId}/images?result=${storageError ? "image-orphan-cleanup" : "image-deleted"}`);
}
