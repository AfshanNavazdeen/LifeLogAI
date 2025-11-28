import { auth, requiresAuth } from "express-openid-connect";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

function getIssuerBaseURL(): string {
  const issuer = process.env.AUTH0_ISSUER_BASE_URL || "";
  if (issuer.startsWith("https://")) {
    return issuer;
  }
  return `https://${issuer}`;
}

function getBaseURL(): string {
  if (process.env.AUTH0_BASE_URL) {
    return process.env.AUTH0_BASE_URL;
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  }
  return "http://localhost:5000";
}

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SESSION_SECRET || "a-long-random-secret-for-sessions",
  baseURL: getBaseURL(),
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: getIssuerBaseURL(),
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
  },
  routes: {
    login: "/api/login",
    logout: "/api/logout",
    callback: "/api/callback",
  },
};

async function upsertUser(claims: any) {
  if (!claims?.sub) return;
  
  await storage.upsertUser({
    id: claims.sub,
    email: claims.email,
    firstName: claims.given_name || claims.nickname || "",
    lastName: claims.family_name || "",
    profileImageUrl: claims.picture || "",
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  app.use(auth(config));
  
  app.use(async (req: any, res, next) => {
    if (req.oidc?.isAuthenticated() && req.oidc?.user) {
      await upsertUser(req.oidc.user);
    }
    next();
  });
  
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.oidc.user.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (req.oidc?.isAuthenticated()) {
    req.user = {
      claims: {
        sub: req.oidc.user.sub,
        email: req.oidc.user.email,
        name: req.oidc.user.name,
      }
    };
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
