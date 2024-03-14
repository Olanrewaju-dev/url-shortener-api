import request from "supertest";
import app from "../index";

describe("Users Endpoints", () => {
  // testing the create user end point
  it("should create a new user", async () => {
    const response = await request(app).post("/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "ijklmno",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", "John Doe");
    expect(response.body).toHaveProperty("email", "johndoe@example.com");
    expect(response.body).toHaveProperty("password");
  });

  // testing the get all users end point
  it("should get all users", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  // testing the get one users by ID end point
  it("should get a user by ID", async () => {
    const response = await request(app).get("/users/1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
  });

  // testing the put/update one users by ID end point
  it("should update a user", async () => {
    const response = await request(app)
      .put("/users/1")
      .send({ name: "Updated Name" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("name", "Updated Name");
    expect(response.body).toHaveProperty("email");
  });

  // testing the delete one users by ID end point

  it("should delete a user", async () => {
    const response = await request(app).delete("/users/1");

    expect(response.status).toBe(204);
  });
});
