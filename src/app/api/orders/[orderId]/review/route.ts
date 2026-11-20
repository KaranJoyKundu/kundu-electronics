import {NextResponse,type NextRequest} from "next/server";
import {hashGuestOrderAccessToken,isUuid,parseHmacSecret} from "@/lib/checkout/security";
import {consumeRequestRateLimit,isAllowedMutationOrigin,jsonError,readJsonBody} from "@/lib/security/request";
import {parseReviewPayload} from "@/lib/reviews/validation";
import {createAdminSupabaseClient} from "@/lib/supabase/admin";
import {createServerSupabaseClient} from "@/lib/supabase/server";
export const runtime="nodejs";export const dynamic="force-dynamic";
type RouteContext={params:Promise<{orderId:string}>};
export async function GET(request:NextRequest,context:RouteContext){
 const {orderId}=await context.params;if(!isUuid(orderId))return jsonError(404,"Order not found.");
 const token=request.cookies.get("ke_order_"+orderId)?.value,secret=parseHmacSecret(process.env.APP_HMAC_SECRET),admin=createAdminSupabaseClient();
 if(!token||!secret||!admin)return jsonError(404,"Order not found.");
 const hash=hashGuestOrderAccessToken(secret,token);
 const {data:summary,error}=await admin.rpc("get_guest_order_summary",{p_order_id:orderId,p_order_access_token_hash:hash});
 if(error||!summary||typeof summary!=="object")return jsonError(404,"Order not found.");
 const info=summary as {fulfilmentStatus?:string;customerName?:string};
 const {data:review}=await admin.from("customer_reviews").select("status").eq("order_id",orderId).maybeSingle();
 return NextResponse.json({eligible:info.fulfilmentStatus==="delivered",customerName:info.customerName||"Customer",reviewStatus:review?.status??null},{headers:{"Cache-Control":"no-store, private"}});
}
export async function POST(request:NextRequest,context:RouteContext){
 if(!isAllowedMutationOrigin(request))return jsonError(403,"Request origin is not allowed.");
 if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))return jsonError(415,"Expected JSON.");
 const {orderId}=await context.params;if(!isUuid(orderId))return jsonError(404,"Order not found.");
 const limited=await consumeRequestRateLimit(request,"order-review-submit",3600,4);
 if(limited==="limited")return jsonError(429,"Review submission limit reached. Please try later.");
 if(limited==="unavailable")return jsonError(503,"Reviews are temporarily unavailable.");
 const payload=parseReviewPayload(await readJsonBody(request,8192));if(!payload)return jsonError(400,"Review details are invalid.");
 const token=request.cookies.get("ke_order_"+orderId)?.value,secret=parseHmacSecret(process.env.APP_HMAC_SECRET),admin=createAdminSupabaseClient();
 if(!token||!secret||!admin)return jsonError(404,"Order not found.");
 const tokenHash=hashGuestOrderAccessToken(secret,token);
 const {data:summary,error:summaryError}=await admin.rpc("get_guest_order_summary",{p_order_id:orderId,p_order_access_token_hash:tokenHash});
 if(summaryError||!summary||typeof summary!=="object")return jsonError(404,"Order not found.");
 const orderSummary=summary as {orderId?:string;orderNumber?:string;customerName?:string;fulfilmentStatus?:string};
 if(orderSummary.fulfilmentStatus!=="delivered")return jsonError(409,"Reviews are available only after delivery.");
 const userClient=await createServerSupabaseClient();const {data:{user}}=userClient?await userClient.auth.getUser():{data:{user:null}};
 const {data:order,error:orderError}=await admin.from("orders").select("customer_user_id,fulfilment_status").eq("id",orderId).maybeSingle();
 if(orderError||!order)return jsonError(404,"Order not found.");
 if(order.customer_user_id&&order.customer_user_id!==user?.id)return jsonError(403,"This order belongs to another customer account.");
 let customerUserId=user?.id??null;
 if(user&&order.customer_user_id===null){
  const {error:claimError}=await admin.rpc("claim_guest_order",{p_order_id:orderId,p_order_access_token_hash:tokenHash,p_user_id:user.id});
  if(claimError)return jsonError(403,"Order could not be linked to your account.");
 }
 const displayName=(payload.displayName||orderSummary.customerName||"Customer").trim().slice(0,80);
 const {error:insertError}=await admin.from("customer_reviews").insert({order_id:orderId,customer_user_id:customerUserId,reviewer_display_name:displayName,rating:payload.rating,review_text:payload.reviewText||null,status:"pending"});
 if(insertError?.code==="23505")return jsonError(409,"A review has already been submitted for this order.");
 if(insertError)return jsonError(503,"Review could not be saved. Please try again.");
 return NextResponse.json({submitted:true,status:"pending",message:"Thank you! Your review is submitted and will appear after moderation."},{headers:{"Cache-Control":"no-store"}});
}