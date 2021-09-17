const request = require("supertest");
const server = require("../api/server");
const db = require("../data/dbConfig");
const jokes = require('./jokes/jokes-data')

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("Register", () => {
  test("Creates a new user, and returns 201 status", async () => {
    const res = await request(server).post('/api/auth/register').send({ username: 'Alexis', password: '1234' })
    expect(res.status).toBe(201)
  });

  test("If missing username or password returns (username and password required)", async () => {
    let res = await request(server)
    .post("/api/auth/register")
    .send({ password: "1234" });
  expect(res.body.message).toMatch(/username and password required/i);
  expect(res.status).toBe(401);
  res = await request(server)
    .post("/api/auth/register")
    .send({ username: "Leonardo" });
  expect(res.body.message).toMatch(/username and password required/i);
  expect(res.status).toBe(401);
}, 750);
});

describe("Login", () => {
  test("If login failed due to username or password, invalid cred", async () => {
      let res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Leto", password: "1234" });
    expect(res.body.message).toMatch(/invalid credentials/i);
    expect(res.status).toBe(401);
    res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Emma", password: "12345" });
    expect(res.body.message).toMatch(/invalid credentials/i);
    expect(res.status).toBe(401);
}, 750);

  test("If missing username or password returns (username and password required", async () => {
    let res = await request(server)
      .post("/api/auth/login")
      .send({ password: "1234" });
    expect(res.body.message).toMatch(/username and password required/i);
    expect(res.status).toBe(401);
    res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Leonardo" });
    expect(res.body.message).toMatch(/username and password required/i);
    expect(res.status).toBe(401);
  }, 750);

});


describe("Jokes", () => {
  test("Responds with dad jokes with valid token", async () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkphbmUiLCJpYXQiOjE2MzE4Nzk1NTUsImV4cCI6MTYzMTk2NTk1NX0.gVKmDsFieBImJDAzMUm0Y3IxkM5exAgZj9FEWp1nzxw'
    const res = await request(server).post('/api/auth/login').send({ password: '1234', username: 'Jane'})
    console.log(res.body)
    const daddy = await request(server).get('/api/jokes').set('Authorization', testToken)
    expect(daddy.body).toMatchObject(jokes)
  }, 750)

  test("Returns [Token required] if none exists", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.body).toMatchObject({
      message: "Token required",
    });
  });

  test("Returns [Token invalid] if wrong token", async () => {
    const res = await request(server).get("/api/jokes").set('Authorization', 'wrong');
    expect(res.body).toMatchObject({
      message: "Token invalid",
    });
  });

});
