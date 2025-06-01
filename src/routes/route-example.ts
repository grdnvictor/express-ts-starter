import { Router } from "express";

export default function (router: Router) {

  router.get("/test", (request, response) => {
    response.json({
      message: "Hello, world!"
    })
  });

  // => Prefer this approach for defining routes
  //    Easier to read and to stack middlewares
  // router.post(
  //   "/authed/important-fake-action",
  //   checkAuthentication,
  //   validateContract(MySuperFakeContract),
  //   MyController.action
  // );


  return router;
}
