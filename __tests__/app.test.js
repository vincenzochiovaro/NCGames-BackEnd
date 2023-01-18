const request = require("supertest");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const { app } = require("../app");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  db.end();
});

describe("app ", () => {
  describe("/api/categories", () => {
    test("respond with a status of 200", () => {
      return request(app).get("/api/categories").expect(200);
    });
    test("respond with a status of 200 and display an array of category objects ", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then((categories) => {
          expect(Array.isArray(categories.body)).toBe(true);
          expect(categories.body).toHaveLength(4);
        });
    });
    test("the object must contain slug and description properties", () => {
      return request(app)
        .get("/api/categories")
        .expect(200)
        .then((categories) => {
          categories.body.forEach((category) => {
            expect(category).toHaveProperty("slug", expect.any(String));
            expect(category).toHaveProperty("description", expect.any(String));
          });
        });
    });
  });
  describe("/api/reviews", () => {
    test("respond with a status of 200 and display an array of review objects sorted by date in descending order ", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then((reviews) => {
          const dateOrderToTest = reviews.body.map((review) => {
            return review.created_at.split("T")[0];
          });

          expect(dateOrderToTest).toBeSorted({ descending: true });
        });
    });
    test("reviews is an array of object with a length of 13 ", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then((reviews) => {
          expect(reviews.body).toHaveLength(13);
        });
    });
    test("each review must contain owner,title,review_id,category,review_img_url, created_at,votes,designer, and comment_count properties ", () => {
      return request(app)
        .get("/api/reviews")
        .expect(200)
        .then((reviews) => {
          reviews.body.forEach((review) => {
            expect(review).toHaveProperty("owner", expect.any(String));
            expect(review).toHaveProperty("title", expect.any(String));
            expect(review).toHaveProperty("category", expect.any(String));
            expect(review).toHaveProperty("designer", expect.any(String));
            expect(review).toHaveProperty("review_img_url", expect.any(String));
            expect(review).toHaveProperty("created_at", expect.any(String));
            expect(review).toHaveProperty("votes", expect.any(Number));
            expect(review).toHaveProperty("comment_count");
          });
        });
    });
  });
  describe("/api/reviews/:review_id", () => {
    test("respond with a status of 200 and display a review object that match with ID endpoint", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then((review) => {
          expect(review.body[0].title).toBe(testData.reviewData[0].title);
          expect(review.body[0].owner).toBe(testData.reviewData[0].owner);
          //prettier-ignore
          expect(review.body[0].review_body).toBe(testData.reviewData[0].review_body);
          expect(review.body[0].designer).toBe(testData.reviewData[0].designer);
          expect(review.body[0].category).toBe(testData.reviewData[0].category);
          expect(review.body[0].votes).toBe(testData.reviewData[0].votes);
          //prettier-ignore
          expect(review.body[0].review_img_url).toBe(testData.reviewData[0].review_img_url);
        });
    });
    test("a review object must have, review_id,title,review_body,designer,review_img_url,votes,category,owner,created_at - property", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then((review) => {
          review.body.forEach((review) => {
            expect(review).toHaveProperty("review_id");
            expect(review).toHaveProperty("title");
            expect(review).toHaveProperty("category");
            expect(review).toHaveProperty("designer");
            expect(review).toHaveProperty("owner");
            expect(review).toHaveProperty("review_body");
            expect(review).toHaveProperty("review_img_url");
            expect(review).toHaveProperty("created_at");
            expect(review).toHaveProperty("votes");
          });
        });
    });
  });
  describe("/api/reviews/:review_id/comments", () => {
    test("respond with a status of 200, and display an array of comments for the given review_id", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then((commentsByReviewId) => {
          expect(Array.isArray(commentsByReviewId.body)).toBe(true);
          expect(commentsByReviewId.body).toHaveLength(3);
        });
    });
    test("each comment must have comment_id,votes,created_at,author,body and review_id properties", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then((commentsByReviewId) => {
          commentsByReviewId.body.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id");
            expect(comment).toHaveProperty("votes");
            expect(comment).toHaveProperty("created_at");
            expect(comment).toHaveProperty("author");
            expect(comment).toHaveProperty("body");
            expect(comment).toHaveProperty("review_id");
          });
        });
    });
    test("comments are displayed with the most recent comment first ", () => {
      return request(app)
        .get("/api/reviews/2/comments")
        .expect(200)
        .then((commentsByReviewId) => {
          //prettier-ignore
          expect(commentsByReviewId.body).toBeSortedBy("created_at", { descending: true,});
        });
    });
    test(`return empty [] if given review_id doesn't match with any comments`, () => {
      return request(app)
        .get("/api/reviews/1/comments")
        .expect(200)
        .then((commentsByReviewId) => {
          expect(Array.isArray(commentsByReviewId.body)).toBe(true);
          expect(commentsByReviewId.body).toHaveLength(0);
        });
    });
  });
  describe("POST /api/reviews/:review_id/comments ", () => {
    test("respond with 201 when a valid comment is posted", () => {
      return request(app)
        .post("/api/reviews/2/comments")
        .send({ username: "philippaclaire9", body: "test comment" })
        .expect(201);
    });
    test("return status 201, responds with an array of comments for the given review_id ", () => {
      return request(app)
        .post("/api/reviews/2/comments")
        .send({ username: "philippaclaire9", body: "test comment" })
        .expect(201)
        .then((comment) => {
          expect(comment.body).toHaveProperty("comment_id", expect.any(Number));
          expect(comment.body).toHaveProperty("body", expect.any(String));
          expect(comment.body).toHaveProperty("review_id", expect.any(Number));
          expect(comment.body).toHaveProperty("author", expect.any(String));
          expect(comment.body).toHaveProperty("votes", expect.any(Number));
          expect(comment.body).toHaveProperty("created_at", expect.any(String));
        });
    });
  });
});
