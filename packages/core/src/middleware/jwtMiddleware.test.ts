import { JwtMiddleware } from "./jwtMiddleware";
import { CloudContextBuilder } from "@multicloud/sls-core";
import { PaddleboardCloudContext } from "@paddleboard/contracts";

describe("JWT Middleware", () => {
  it("decodes and sets context", async () => {
    const builder = new CloudContextBuilder();
    const context: PaddleboardCloudContext = builder
      .asHttpRequest()
      .withRequestMethod("GET")
      .withRequestHeaders({
        "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsifQ.eyJpc3MiOiJodHRwczovL3BhZGRsZWJvYXJkLmIyY2xvZ2luLmNvbS84MjI1M2JmYy0wMmEyLTQ2YTAtOGZhZS1hY2ZhYWYzMTBkYjkvdjIuMC8iLCJleHAiOjE1NzA4NDUzNjUsIm5iZiI6MTU3MDg0MTc2NSwiYXVkIjoiYTEzYmUzMGQtYmRkNy00YjQ1LTg4OWYtYWRiZGMxNmYwMWY2IiwiaWRwX2FjY2Vzc190b2tlbiI6IjU2ODU2N2Y3ZDlhYjdiNjZlNTYyYjFiZmVlMmQ5OGIxYmQxMGNkZjEiLCJpZHAiOiJnaXRodWIuY29tIiwib2lkIjoiODZjOGM1ZTQtMmVmYS00ZGZmLWJkMWQtZWZlZjM2MTU5NjY4Iiwic3ViIjoiODZjOGM1ZTQtMmVmYS00ZGZmLWJkMWQtZWZlZjM2MTU5NjY4IiwiZ2l2ZW5fbmFtZSI6IldhbGxhY2UiLCJmYW1pbHlfbmFtZSI6IkJyZXphIiwidGZwIjoiQjJDXzFfc2lnbl91cF9zaWduX2luIiwibm9uY2UiOiJkZWZhdWx0Tm9uY2UiLCJzY3AiOiJ1c2VyLndyaXRlLmFsbCBjYXRlZ29yeS53cml0ZS5hbGwgcmVwb3NpdG9yeS53cml0ZS5hbGwgdXNlci53cml0ZSByZXBvc2l0b3J5LnJlYWQgcmVwb3NpdG9yeS53cml0ZSBjYXRlZ29yeS5yZWFkIGNhdGVnb3J5LndyaXRlIHVzZXIucmVhZC5hbGwgY2F0ZWdvcnkucmVhZC5hbGwgcmVwb3NpdG9yeS5yZWFkLmFsbCB1c2VyX2ltcGVyc29uYXRpb24iLCJhenAiOiJmZmNlOGNlZC0zY2IwLTQxMWUtYmEyYi0yYTZjNGNmMzY0NzAiLCJ2ZXIiOiIxLjAiLCJpYXQiOjE1NzA4NDE3NjV9.LhQ-FPkCkfOollYkcv0ayu_J6yz5dM-r-Cy77KJvAJ8cFW3FQaQUaGiPWxutUNjC2BX_8I01tfFuKAEpnRT9iLaVwWREDMItipUPV8hqlMQ2kCxK4gRX3A9g05CUY0mbfAxv6g95bCDDB0lt8KA8Itk9NjKQqUYmmWlY-hAgyGtE3W5obNLITyU5ceg5T3tNHQCh096podMujh-qQfNtunxiGqVs6GlpVgfzfjnTS5W27mQq766VOMPwnfhJDoeNE422dbJOzZt4wgmt2yJiZ90s5C5SlphJcPEZLwlQxtfvC3g2--gWhEvWTY78MFjdZjCxjH8-fIr3fIHqWJVJ4A"
      })
      .build();

    JwtMiddleware()(context, jest.fn());

    expect(context.identity).toBeDefined();
  });
});
