const request = require("supertest");
const server = require("../api/server");
const db = require("../data/dbConfig");
const jwtDecode = require("jwt-decode");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("Register", () => {
  test("Returns invalid credentials if incorrect username or password", async () => {
    let res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Leito", password: "1234" });
    expect(res.body.message).toMatch(/invalid credentials/i);
    expect(res.status).toBe(401);
    res = await request(server)
      .post("/api/auth/login")
      .send({ username: "Emma", password: "12345" });
    expect(res.body.message).toMatch(/invalid credentials/i);
    expect(res.status).toBe(401);
  }, 750);

  test("If missing username or password returns (username and password required)", async () => {
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

describe("Login", () => {
  test("If login failed due to username or password, invalid creds", () => {
    
  });
  test("If login failed due to username or password, invalid creds", () => {});

});


describe("Jokes", () => {
  test("Responds with dad jokes if given valid token", async () => {

    let res = await request(server).post('/api/auth/login').send({ username: 'Emi', password: '1234' })
    res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
    expect(res.body).toMatch(/tired of following my dreams/i)
  }, 750)

  test("Returns [Token required] if none exists", async () => {
    const res = await request(server).get("/api/jokes");

    expect(res.body).toMatchObject({
      message: "Token required",
    });
  });
});
