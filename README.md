# Nevis

*A Personal Mini Project to Practice*

Welcome.

This project is **not** production-quality at all. For educational purposes, we decided to deliberately not use any build tools, transpilers, uglifiers, etc on the client side.   
Anyway, here are some of tools and patterns used in this project:
  
- Client Side Routing (No frameworks)  
- Session Based Authentication (No frameworks)  
- API Pagination (according to [the article](https://mysql.rjweb.org/doc.php/pagination) by Mr Rich James)  
- Unit & Integration Testing (No frameworks, using Nodejs native test-runner), though huge parts of the codebase is still uncovered. Having 100% test coverage is out of scope of this mini project.  
- Basic Caching (Redis)  
- (Semi-?)Idempotent POST  
- E2E Testing (Playwright)