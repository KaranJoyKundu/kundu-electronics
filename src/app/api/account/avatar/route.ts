import {NextResponse,type NextRequest} from "next/server";
import {consumeRequestRateLimit,isAllowedMutationOrigin,jsonError} from "@/lib/security/request";
import {verifiedProductImageExtension} from "@/lib/security/image-signature";
import {createAdminSupabaseClient} from "@/lib/supabase/admin";
import {createServerSupabaseClient} from "@/lib/supabase/server";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 if(!isAllowedMutationOrigin(request))return jsonError(403,"Request origin is not allowed.");
 const limited=await consumeRequestRateLimit(request,"customer-avatar-upload",3600,5);
 if(limited==="limited")return jsonError(429,"Too many profile photo uploads. Please try later.");
 if(limited==="unavailable")return jsonError(503,"Photo upload is temporarily unavailable.");
 const client=await createServerSupabaseClient();if(!client)return jsonError(503,"Account services are not configured.");
 const {data:{user},error:userError}=await client.auth.getUser();if(userError||!user)return jsonError(401,"Sign in first.");
 const form=await request.formData().catch(()=>null);const file=form?.get("avatar");
 if(!(file instanceof File)||file.size<12||file.size>2*1024*1024)return jsonError(400,"Choose an image up to 2 MB.");
 const mime=file.type.toLowerCase(),bytes=new Uint8Array(await file.arrayBuffer()),extension=verifiedProductImageExtension(mime,bytes);
 if(!extension)return jsonError(400,"Image file type or content is not supported.");
 const admin=createAdminSupabaseClient();if(!admin)return jsonError(503,"Storage is not configured.");
 const path=user.id+"/"+crypto.randomUUID()+"."+extension;
 const {error:uploadError}=await admin.storage.from("customer-avatars").upload(path,bytes,{contentType:mime,cacheControl:"3600",upsert:false});
 if(uploadError)return jsonError(503,"Profile photo upload failed.");
 return NextResponse.json({path},{headers:{"Cache-Control":"no-store"}});
}