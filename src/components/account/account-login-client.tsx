"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { guestOrderIdFromNextPath, safeAccountNextPath } from "@/lib/account/redirect";
export function AccountLoginClient({ nextPath }: { nextPath: string }) {
 const router = useRouter(), safeNext = safeAccountNextPath(nextPath);
 const [email,setEmail]=useState(""),[code,setCode]=useState(""),[step,setStep]=useState<"email"|"otp">("email"),[busy,setBusy]=useState(false),[cooldown,setCooldown]=useState(0),[message,setMessage]=useState(""),[error,setError]=useState("");
 useEffect(()=>{if(cooldown<=0)return;const timer=window.setInterval(()=>setCooldown(v=>Math.max(0,v-1)),1000);return()=>window.clearInterval(timer)},[cooldown]);
 async function sendCode(normalized=email.trim().toLowerCase()) {
  setError("");setMessage("");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)){setError("Enter a valid email address.");return}
  const supabase=createBrowserSupabaseClient();if(!supabase){setError("Customer sign-in is not configured yet.");return}
  setBusy(true);const {error:sendError}=await supabase.auth.signInWithOtp({email:normalized,options:{shouldCreateUser:true}});setBusy(false);
  if(sendError){setError("We could not send a code. Please wait a moment and try again.");return}
  setEmail(normalized);setStep("otp");setCooldown(60);setMessage("A six-digit sign-in code was sent.");
 }
 async function verifyCode(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");setMessage("");
  if(!/^\d{6}$/.test(code.trim())){setError("Enter the six-digit code from your email.");return}
  const supabase=createBrowserSupabaseClient();if(!supabase){setError("Customer sign-in is not configured yet.");return}
  setBusy(true);const {error:verifyError}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:code.trim(),type:"email"});
  if(verifyError){setBusy(false);setError("That code is invalid or expired. Request a new one.");return}
  const orderId=guestOrderIdFromNextPath(safeNext);
  if(orderId){const claim=await fetch(`/api/orders/${orderId}/claim`,{method:"POST",credentials:"same-origin",headers:{Accept:"application/json"}}).catch(()=>null);
   if(!claim?.ok){setBusy(false);setError("Signed in, but this order could not be linked. Keep the order page open.");return}}
  setBusy(false);router.replace(safeNext);router.refresh();
 }
 return <section className="account-login-card"><span className="section-kicker">CUSTOMER ACCOUNT</span><h2>{step==="email"?"Sign in or create an account":"Check your inbox"}</h2><p>Use your email and a one-time code. Guests can still checkout without an account.</p>
 {step==="email"?<form className="account-form" onSubmit={e=>{e.preventDefault();void sendCode()}}>
 <label>Email address<input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
 {error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="form-success" role="status">{message}</p>}
 <button className="button button-primary" type="submit" disabled={busy}>{busy?"Sending code…":"Send email code"}</button></form>
 :<form className="account-form" onSubmit={verifyCode}><label>Six-digit code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000"/></label><p className="account-login-email">{email}</p>
 {error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="form-success" role="status">{message}</p>}
 <button className="button button-primary" type="submit" disabled={busy}>{busy?"Verifying…":"Verify code"}</button><button className="button button-secondary" type="button" disabled={busy||cooldown>0} onClick={()=>void sendCode()}>{cooldown>0?`Resend in ${cooldown}s`:"Resend code"}</button><button className="account-back-link" type="button" disabled={busy} onClick={()=>{setStep("email");setCode("");setError("");setMessage("")}}>Change email</button></form>}
 </section>;
}