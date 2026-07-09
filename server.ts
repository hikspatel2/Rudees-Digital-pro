import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { portfolios, reviews, leads, whatsappLeads } from "./src/db/schema.ts";
import { requireAuth } from "./src/middleware/auth.ts";
import { authenticate, destroySession, updatePassword } from "./src/db/auth.ts";
import { eq, desc, asc } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes for Cloud SQL interaction
  app.get("/api/portfolios", async (req, res) => {
    try {
      const data = await db.select().from(portfolios).orderBy(asc(portfolios.displayOrder), desc(portfolios.createdAt));
      // Map screenshots back to array if it was stored as string
      const formattedData = data.map(p => ({
        ...p,
        screenshots: p.screenshots ? JSON.parse(p.screenshots) : []
      }));
      res.json(formattedData);
    } catch(err) {
      console.log(err);
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  // Example insert
  app.post("/api/portfolios", requireAuth, async (req, res) => {
    try {
      const body = req.body;
      if (body.screenshots && Array.isArray(body.screenshots)) {
        body.screenshots = JSON.stringify(body.screenshots);
      }
      
      const inserted = await db.insert(portfolios).values(body).returning();
      res.json({
        ...inserted[0],
        screenshots: inserted[0].screenshots ? JSON.parse(inserted[0].screenshots) : []
      });
    } catch(err) {
      console.log(err);
      res.status(500).json({ error: "Failed to insert portfolio" });
    }
  });

  app.put("/api/portfolios/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const body = req.body;
      if (body.screenshots && Array.isArray(body.screenshots)) {
        body.screenshots = JSON.stringify(body.screenshots);
      }

      const updated = await db.update(portfolios)
        .set(body)
        .where(eq(portfolios.id, id))
        .returning();
      
      if (updated.length === 0) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      
      res.json({
        ...updated[0],
        screenshots: updated[0].screenshots ? JSON.parse(updated[0].screenshots) : []
      });
    } catch(err) {
      console.log(err);
      res.status(500).json({ error: "Failed to update portfolio" });
    }
  });

  app.delete("/api/portfolios/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await db.delete(portfolios)
        .where(eq(portfolios.id, id))
        .returning();
      
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      
      res.json({ success: true, deletedId: id });
    } catch(err) {
      console.log(err);
      res.status(500).json({ error: "Failed to delete portfolio" });
    }
  });

  
  // Reviews API
  app.get("/api/reviews", async (req, res) => {
    try {
      const data = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
      res.json(data);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });
  
  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const data = req.body;
      const result = await db.insert(reviews).values(data).returning();
      res.json(result[0]);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });

  app.put("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await db.update(reviews).set(data).where(eq(reviews.id, Number(id))).returning();
      res.json(result[0]);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });

  app.delete("/api/reviews/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(reviews).where(eq(reviews.id, Number(id)));
      res.json({success: true});
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });

  // Leads API
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const data = await db.select().from(leads).orderBy(desc(leads.createdAt));
      res.json(data);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });

  app.post("/api/leads", async (req, res) => { // public for form submission
    try {
      const data = req.body;
      const result = await db.insert(leads).values(data).returning();
      res.json(result[0]);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });
  
  app.put("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await db.update(leads).set(data).where(eq(leads.id, Number(id))).returning();
      res.json(result[0]);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });
  
  app.delete("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(leads).where(eq(leads.id, Number(id)));
      res.json({success: true});
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });

  // WhatsApp Leads API
  app.get("/api/whatsapp-leads", requireAuth, async (req, res) => {
    try {
      const data = await db.select().from(whatsappLeads).orderBy(desc(whatsappLeads.createdAt));
      res.json(data);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });

  app.post("/api/whatsapp-leads", async (req, res) => { // public
    try {
      const data = req.body;
      const result = await db.insert(whatsappLeads).values(data).returning();
      res.json(result[0]);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });
  
  app.put("/api/whatsapp-leads/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await db.update(whatsappLeads).set(data).where(eq(whatsappLeads.id, Number(id))).returning();
      res.json(result[0]);
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });
  
  app.delete("/api/whatsapp-leads/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(whatsappLeads).where(eq(whatsappLeads.id, Number(id)));
      res.json({success: true});
    } catch(err) {
      console.log(err);
      res.status(500).json({error: "Server Error"});
    }
  });

  
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const token = authenticate(username, password);
    if (token) {
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      destroySession(token);
    }
    res.json({ success: true });
  });

  app.post("/api/change-password", requireAuth, (req: any, res) => {
    const { newPassword } = req.body;
    if (newPassword && newPassword.length >= 6) {
      updatePassword(req.user.username, newPassword);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Password must be at least 6 characters" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "mpa", // It's multi-page
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html')); // MPA might need specific routing
    });
  }

    app.post("/api/debug-log", express.json(), (req, res) => {
    require('fs').appendFileSync('frontend_debug.log', JSON.stringify(req.body) + '\n');
    res.json({ok: true});
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
