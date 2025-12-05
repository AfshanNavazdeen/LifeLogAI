import { auth, requiresAuth } from "express-openid-connect";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

const DEV_STATIC_USER = process.env.DEV_STATIC_USER === "true";
const STATIC_USER_ID = "dev-static-user-001";
const STATIC_USER = {
  id: STATIC_USER_ID,
  email: "dev@lifelog.local",
  firstName: "Dev",
  lastName: "User",
  profileImageUrl: "",
};

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

const baseURL = getBaseURL();

const config = {
  authRequired: false,
  auth0Logout: true,
  idpLogout: true,
  secret: process.env.SESSION_SECRET || "a-long-random-secret-for-sessions",
  baseURL: baseURL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: getIssuerBaseURL(),
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
  },
  routes: {
    login: "/api/login",
    logout: false as const,
    callback: "/api/callback",
    postLogoutRedirect: "/",
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
  
  if (DEV_STATIC_USER) {
    console.log("⚠️  DEV MODE: Using static user authentication (Auth0 bypassed)");
    await storage.upsertUser(STATIC_USER);
    
    app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
      try {
        const user = await storage.getUser(STATIC_USER_ID);
        res.json(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    });
    
    app.get("/api/login", (req, res) => {
      res.redirect("/");
    });
    
    app.get("/api/logout", (req, res) => {
      res.redirect("/");
    });
  } else {
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
    
    app.get("/api/logout", (req: any, res) => {
      console.log("Logout requested, redirecting to Auth0 logout with returnTo:", baseURL);
      res.oidc.logout({
        returnTo: baseURL,
      });
    });
  }
}

export const isAuthenticated: RequestHandler = (req: any, res, next) => {
  if (DEV_STATIC_USER) {
    req.user = {
      claims: {
        sub: STATIC_USER_ID,
        email: STATIC_USER.email,
        name: `${STATIC_USER.firstName} ${STATIC_USER.lastName}`,
      }
    };
    return next();
  }
  
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
