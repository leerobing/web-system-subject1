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

const DIR = "data/";

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, DIR);
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, `${req.body.id}${ext}`);
    },
  }),
});
try {
  fs.readdirSync(DIR);
} catch (error) {
  fs.mkdirSync(DIR);
}
// 사용자 정보 추가
app.post("/cid", upload.single("image"), (req, res) => {
  const { id, name, birth, gender } = req.body;
  users[id] = { name, birth, gender, img: req.file?.path ?? " " };
  res.sendFile(path.join(PUBLIC, "index.html"));
});

// 사용자 정보 조회
app.get("/rid", (req, res) => {
  const id = req.query.id; //쿼리스트링에 아이디를 받아온다.
  const userInfo = users[id];

  if (userInfo) {
    res.send(JSON.stringify(userInfo)); //JSON.stringify( )는 자바스크립트의 값을 JSON 문자열로 변환한다.
  } else {
    res.status(404).send("존재하지 않은 회원입니다.");
  }
});

// // 사용자 정보 수정
app.post("/uid", upload.single("image"), (req, res) => {
  const { id, name, birth, gender } = req.body;

  if (!users[id]) {
    return res.status(404).send(`존재하지 않은 회원입니다 : ${id}`);
  }

  users[id] = { name, birth, gender, img: req.file?.path ?? " " };
  res.sendFile(path.join(PUBLIC, "index.html"));
});

// 사용자 정보 삭제
app.get("/did", (req, res) => {
  const id = req.query.id;
  const userData = users[id];

  if (!userData) {
    return res.status(404).send(`존재하지 않은 ID: ${id}`);
  }

  // 파일이 비어있어도 삭제
  if (userData.img) {
    const filePath = path.join(DIR, path.basename(userData.img)); // 파일 경로 생성
    fs.unlink(filePath);
  }

  // 유저 데이터 삭제
  delete users[id];
  res.redirect(301, "/index.html");
});

app.listen(app.get("port"), () =>
  console.log(`${app.get("port")} 번 포트에서 대기 중`)
);
