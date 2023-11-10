const express = require("express");
const dotenv = require("dotenv");

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const path = require("path");
const multer = require("multer");
const fs = require("fs");

dotenv.config();

const PUBLIC = path.join(__dirname, "public");

const users = {};

const app = express();
app.set("port", process.env.PORT || 5001);

app.use(
  morgan("dev"),
  express.static(PUBLIC),
  express.json(),
  express.urlencoded({ extended: false }),
  cookieParser(process.env.SECRET),
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name: "session-cookie",
  })
);

app.get("/", (_, res) => res.sendFile(path.join(PUBLIC, "index.html")));
app.get("/users", (_, res) => res.send(JSON.stringify(users)));
app.get("/create", (_, res) => res.sendFile(path.join(PUBLIC, "create.html")));
app.get("/read", (_, res) => res.sendFile(path.join(PUBLIC, "read.html")));
app.get("/update", (_, res) => res.sendFile(path.join(PUBLIC, "update.html")));
app.get("/delete", (_, res) => res.sendFile(path.join(PUBLIC, "delete.html")));

const DIR = "/data";

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, DIR);
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, `${req.body.id}${ext}}`);
    },
  }),
});

// 사용자 정보 추가
app.post("/cid", upload.single("image"), (req, res) => {
  const { id, name, birth, gender } = req.body;
  users[id] = { name, birth, gender, img: req.file?.path ?? " " };
  res.sendFile(path.join(PUBLIC, "index.html"));
});

// 사용자 정보 조회

// 사용자 정보 수정

// 사용자 정보 삭제
// fs.unlink(users[id].img);
// delete users[id];

app.listen(app.get("port"), () =>
  console.log(`${app.get("port")} 번 포트에서 대기 중`)
);
