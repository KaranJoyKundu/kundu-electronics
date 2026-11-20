import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountProfileClient } from "@/components/account/account-profile-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export const metadata:Metadata={title:"My account"};
export default async function AccountPage(){
 const supabase=await createServerSupabaseClient();
 if(!supabase)return <main className="container account-page"><h1>Account</h1><p>Customer accounts are not configured yet.</p></main>;
 const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/account/login?next=%2Faccount");
 return <main className="container account-page"><div className="account-page-heading"><span className="section-kicker">CUSTOMER ACCOUNT</span><h1>My account</h1><p>Manage profile, saved addresses, orders and reviews.</p></div><AccountProfileClient userId={user.id} email={user.email??""}/></main>
}