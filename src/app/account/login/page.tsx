import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountLoginClient } from "@/components/account/account-login-client";
import { safeAccountNextPath } from "@/lib/account/redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export const metadata:Metadata={title:"Sign in · Customer account"};
export default async function AccountLoginPage({searchParams}:{searchParams:Promise<{next?:string}>}){
 const params=await searchParams,nextPath=safeAccountNextPath(params.next),supabase=await createServerSupabaseClient();
 if(supabase){const {data:{user}}=await supabase.auth.getUser();if(user)redirect(nextPath)}
 return <main className="container account-page account-login-page"><div className="account-page-heading"><span className="section-kicker">KUNDU ELECTRONICS</span><h1>Your customer account</h1></div><AccountLoginClient nextPath={nextPath}/></main>
}