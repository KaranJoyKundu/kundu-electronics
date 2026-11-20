import Link from "next/link";
import {OrderReviewClient} from "@/components/orders/order-review-client";
export default async function ReviewPage({params}:{params:Promise<{orderId:string}>}){
 const {orderId}=await params;
 return <main className="container simple-page account-page order-review-page"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={"/orders/"+orderId}>Order status</Link><span>/</span><span>Review</span></div><span className="section-kicker">CUSTOMER FEEDBACK</span><h1>How was your order?</h1><p>Leave a rating or optional feedback. Reviews are moderated before appearing publicly.</p><OrderReviewClient orderId={orderId} customerName="Customer"/><section className="notice-panel"><p>Review us on the <Link href="/#customer-reviews">website</Link> or on <a href="https://www.facebook.com/KunduBrothersElectronics/" target="_blank" rel="noreferrer">Facebook</a>.</p><Link href="/">Return to shop</Link></section></main>
}