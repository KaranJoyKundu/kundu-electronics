import { NextResponse,type NextRequest } from "next/server";
import { hashGuestOrderAccessToken,isUuid,parseHmacSecret } from "@/lib/checkout/security";
import { consumeRequestRateLimit,isAllowedMutationOrigin,jsonError } from "@/lib/security/request";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export const runtime="nodejs";export const dynamic="force-dynamic";
type RouteContext={params:Promise<{orderId:string}>};
export async function POST(request:NextRequest,context:RouteContext){
 const {orderId}=await context.params;if(!isUuid(orderId))return jsonError(404,"Order not found.");
 if(!isAllowedMutationOrigin(request))return jsonError(403,"Request origin is not allowed.");
 const limited=await consumeRequestRateLimit(request,"guest-order-claim",600,5);
 if(limited==="limited")return jsonError(429,"Too many account-link attempts. Please wait.");
 if(limited==="unavailable")return jsonError(503,"Account linking is temporarily unavailable.");
 const userClient=await createServerSupabaseClient();if(!userClient)return jsonError(503,"Account linking is not configured.");
 const {data:{user},error:userError}=await userClient.auth.getUser();if(userError||!user)return jsonError(401,"Sign in to link this order.");
 const token=request.cookies.get(`ke_order_${orderId}`)?.value,secret=parseHmacSecret(process.env.APP_HMAC_SECRET),admin=createAdminSupabaseClient();
 if(!token||!secret||!admin)return jsonError(404,"Order not found.");
 const tokenHash=hashGuestOrderAccessToken(secret,token);
 const {error}=await admin.rpc("claim_guest_order",{p_order_id:orderId,p_order_access_token_hash:tokenHash,p_user_id:user.id});
 if(error?.code==="42501")return jsonError(403,"This order cannot be linked to this account.");
 if(error)return jsonError(503,"Order linking failed. Please try again.");
 return NextResponse.json({linked:true},{headers:{"Cache-Control":"no-store"}});
}