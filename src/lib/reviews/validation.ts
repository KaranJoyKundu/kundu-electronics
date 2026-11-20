export type ReviewPayload={rating:number;reviewText:string;displayName:string};
export function parseReviewPayload(value:unknown):ReviewPayload|null{
 if(!value||typeof value!=="object"||Array.isArray(value))return null;
 const v=value as Record<string,unknown>;
 if(typeof v.rating!=="number"||!Number.isInteger(v.rating)||v.rating<1||v.rating>5)return null;
 if(v.reviewText!==undefined&&typeof v.reviewText!=="string")return null;
 if(v.displayName!==undefined&&typeof v.displayName!=="string")return null;
 const reviewText=(v.reviewText??"").trim(),displayName=(v.displayName??"").trim();
 if(reviewText.length>1000||displayName.length>80)return null;
 return {rating:v.rating,reviewText,displayName};
}