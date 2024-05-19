import rateLimit from "express-rate-limit";

export const limiter10Req1Minute = rateLimit({
	windowMs: 1 * 60 * 1000,
	limit: 10, 
})


export const limiter50Req10Minute = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 50, 
})