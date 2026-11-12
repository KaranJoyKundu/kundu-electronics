import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createCategory, updateCategory } from "../actions";

export const metadata: Metadata = { title: "Categories · Admin" };
const statuses = ["draft", "review", "published", "archived"];

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const [{ result }, supabase] = await Promise.all([searchParams, createServerSupabaseClient()]);
  if (!supabase) return <section className="simple-page"><h1>Categories</h1><p>Connect Supabase to manage categories.</p></section>;
  const { data, error } = await supabase.from("categories").select("id,parent_id,slug,name,description,status,sort_order").order("sort_order").order("name");
  if (error) return <section className="simple-page"><h1>Categories</h1><p>Category data is unavailable. Apply the reviewed migration and check staff permissions.</p></section>;
  const categories = data ?? [];
  return <section className="admin-page">
    <div className="admin-page-heading"><div><span className="section-kicker">CATALOGUE STRUCTURE</span><h1>Categories</h1><p>Publish parent categories before child categories and products.</p></div></div>
    {result ? <p role="status" className={result === "saved" ? "admin-result-success" : "admin-result-error"}>{result === "saved" ? "Changes saved." : "The category could not be saved. Check its slug, parent and status."}</p> : null}
    <details className="admin-editor" open={categories.length === 0}><summary>Add category</summary><form action={createCategory} className="admin-form-grid">
      <label>Name<input name="name" required maxLength={120} /></label><label>Slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
      <label>Parent<select name="parentId" defaultValue=""><option value="">Top level</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Status<select name="status" defaultValue="draft">{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Sort order<input type="number" name="sortOrder" defaultValue="0" min="-100000" max="100000" /></label>
      <label>Description<textarea name="description" rows={2} maxLength={1000} /></label>
      <button className="button button-primary" type="submit">Create category</button>
    </form></details>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Category</th><th>Parent</th><th>Status</th><th>Sort</th><th>Edit</th></tr></thead><tbody>
      {categories.length === 0 ? <tr><td colSpan={5}>No categories yet.</td></tr> : categories.map((category) => <tr key={category.id}>
        <td><strong>{category.name}</strong><small>/{category.slug}</small></td><td>{categories.find((item) => item.id === category.parent_id)?.name ?? "Top level"}</td><td>{category.status}</td><td>{category.sort_order}</td>
        <td><details><summary>Edit</summary><form action={updateCategory} className="admin-inline-form">
          <input type="hidden" name="id" value={category.id} />
          <label>Name<input name="name" defaultValue={category.name} required maxLength={120} /></label>
          <label>Slug<input name="slug" defaultValue={category.slug} required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
          <label>Parent<select name="parentId" defaultValue={category.parent_id ?? ""}><option value="">Top level</option>{categories.filter((item) => item.id !== category.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Status<select name="status" defaultValue={category.status}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Sort order<input name="sortOrder" type="number" defaultValue={category.sort_order} /></label>
          <label>Description<textarea name="description" rows={2} defaultValue={category.description ?? ""} maxLength={1000} /></label>
          <button className="button button-small" type="submit">Save category</button>
        </form></details></td>
      </tr>)}
    </tbody></table></div>
  </section>;
}
