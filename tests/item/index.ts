// const request = require('supertest');
import request from "supertest";

it("should return something useful...", async () => {
  await request(strapi.server.httpServer)
    .get("/api/items/")
    .expect(200) // Expect response http code 200
    .then((data) => {
      expect(data.lenth).toBe(0); // expect the response text
    });
});
