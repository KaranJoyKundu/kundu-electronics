import assert from "node:assert/strict";
import test from "node:test";
import {parseReviewPayload} from "./validation.ts";
test("accepts a star rating with optional text and display name",()=>{assert.deepEqual(parseReviewPayload({rating:5,reviewText:"Great",displayName:"Customer"}),{rating:5,reviewText:"Great",displayName:"Customer"});assert.deepEqual(parseReviewPayload({rating:4}),{rating:4,reviewText:"",displayName:""})});
test("rejects malformed rating and overlong fields",()=>{assert.equal(parseReviewPayload({rating:0}),null);assert.equal(parseReviewPayload({rating:5.5}),null);assert.equal(parseReviewPayload({rating:6}),null);assert.equal(parseReviewPayload({rating:3,reviewText:"x".repeat(1001)}),null);assert.equal(parseReviewPayload({rating:3,displayName:"x".repeat(81)}),null);assert.equal(parseReviewPayload(null),null)});
