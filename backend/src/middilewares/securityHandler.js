import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import xss from "xss-clean";
// Note: xss-clean is deprecated, not recommended. We'll skip it for clean code.

export const securityMiddlewares = [
  // Set various HTTP security headers
  helmet(),

  // Enable CORS (local dev: allow all origins OR restrict if needed)
  cors({
    origin: "*", // ⚠️ In production, replace '*' with ["https://yourdomain.com"]
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies if you need in future
  }),

  // Disable DNS prefetching (optional, mostly for production)
  // helmet.dnsPrefetchControl({ allow: false }),

  // Control loading of resources via Content Security Policy
  // In local dev, CSP strict policies can block localhost APIs, so COMMENT it
  /*
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://secure.gravatar.com"],
      connectSrc: ["'self'", "wss://yourdomain.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }),
  */

  // Force HTTPS (HSTS) - ONLY enable in production
  /*
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  }),
  */

  // Prevent MIME sniffing
  helmet.noSniff(),

  // Hide X-Powered-By: Express
  helmet.hidePoweredBy(),

  // Prevent Clickjacking
  helmet.frameguard({ action: "deny" }),

  // XSS Protection (older browsers only, safe to leave)
  helmet.xssFilter(),
   // Sanitize user input against XSS (Cross-Site Scripting)
   xss(),
  // Prevent referrer information leaking
  helmet.referrerPolicy({ policy: "no-referrer" }),

  // Restrict cross-domain Flash/PDF (very old browsers - safe)
  helmet.permittedCrossDomainPolicies({ permittedPolicies: "none" }),

  // Sanitize MongoDB NoSQL query inputs
  mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️ MongoSanitize blocked a dangerous key: ${key} in ${req.method} ${req.url}`);
    },
  }),

  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: ["duration", "price", "ratingsAverage", "difficulty"], // Example of allowed duplicate params
  }),

  // Compress responses (gzip)
 // for api response ,payloads to compress the data to be send to client
compression({
    level:6,// mid level compression... 1 to 9 1 (fast, least compression) to (slow, high compression).
    threshold:0,//This means all responses will be compressed, regardless of size.
    // threshold: 1024, // compress data larger than 1024 kb
    filter: (req, res) => {
        if (req.headers["accept-encoding"]?.includes("gzip")) {
            return true; // Enable compression if client supports gzip
        }
    
        if (req.headers["x-no-compression"]) {
            return false; // Disable compression if client explicitly requests no compression
        }
    
        return compression.filter(req, res); // Use default behavior
    },
}),
];
