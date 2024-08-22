import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import path from "node:path";
import { User } from "./models/user";
import { signToken, verifyToken } from "./utils/auth";
import { fetchUser, initialize, loginUser, updateUser } from "./utils/db";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (_: Request, res: Response) => {
  return res.render("index", {
    page: "Log In",
    alert: {},
  });
});

app.post("/", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await loginUser(username, password);

  if (user === null) {
    return res.render("index", {
      page: "Log In",
      alert: { error: "Incorrect username or password." },
    });
  }

  const token = signToken(user);
  res.cookie("session", token);
  return res.redirect("/profile");
});

app.get("/profile", async (req: Request, res: Response) => {
  const { session = "" } = req.cookies;
  const claims = verifyToken(session);
  if (claims === null) {
    return res.redirect("/");
  }

  const user = await fetchUser(claims.username);
  if (user === null) {
    return res.redirect("/");
  }

  return res.render("profile", {
    page: "Profile",
    alert: {},
    user,
  });
});

app.post("/profile", async (req: Request, res: Response) => {
  const { session = "" } = req.cookies;
  const claims = verifyToken(session);
  if (claims === null) {
    return res.redirect("/");
  }

  const updates = req.body as User;
  await updateUser(claims.username, updates);

  const user = await fetchUser(claims.username);
  if (user === null) {
    return res.redirect("/");
  }

  return res.render("profile", {
    page: "Profile",
    alert: { success: "Password updated." },
    user,
  });
});

app.get("/logout", (_: Request, res: Response) => {
  res.clearCookie("session");
  return res.redirect("/");
});

app.get("/admin", (req: Request, res: Response) => {
  const { session = "" } = req.cookies;
  const claims = verifyToken(session);
  if (claims === null) {
    return res.redirect("/");
  }

  if (claims.role !== "administrator") {
    return res.redirect("/profile");
  }

  return res.render("admin", {
    page: "Admin Panel",
    flag: "APX{m455_4551gnm3nt_v4l1d4t10n_15_1mp0rt4nt}",
  });
});

(async () => {
  await initialize();
  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
})();
