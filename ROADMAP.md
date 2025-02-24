# Roadmap

- Update CI/CD and release process
- Auth refresh
  - Tokens are only valid for 1h.
  - Function to check the token validity on every request and renew if neccessary.
  - JWT library for decoding or own implementation.
  - TODO seperate auth refresher so other engine implementations can use it.
    - Or built into the abstract engine? better seperate maybe not every engine needs it.
