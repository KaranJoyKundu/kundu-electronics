import { notFound } from "next/navigation";
import { getPublishedProducts } from "@/data/catalogue";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getPublishedProducts().find((item) => item.slug === slug);
  if (!product) notFound();
  return <section className="container simple-page"><span className="section-kicker">PRODUCT</span><h1>{product.name}</h1><p>{product.summary}</p></section>;
}
